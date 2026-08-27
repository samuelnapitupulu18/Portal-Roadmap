const jiraClient = require('../lib/JiraClient');
const cache = require('./CacheService');
const seedStories = require('../data/stories.seed');
const { config, STORY_STATUS, CACHE_KEYS } = require('../config');
const logger = require('../lib/Logger');

const CTX = 'RoadmapService';

const TAG_COLORS = [
  '#63b3ed', '#d69e2e', '#68d391', '#ed8936',
  '#ed64a6', '#9f7aea', '#f56565', '#4fd1c5',
];

const STATUS_MAP = {
  'to do': STORY_STATUS.PLANNED,
  'open': STORY_STATUS.PLANNED,
  'backlog': STORY_STATUS.PLANNED,
  'planned': STORY_STATUS.PLANNED,
  'new': STORY_STATUS.PLANNED,
  'in progress': STORY_STATUS.IN_PROGRESS,
  'in development': STORY_STATUS.IN_PROGRESS,
  'development': STORY_STATUS.IN_PROGRESS,
  'in review': STORY_STATUS.TESTING,
  'in qa': STORY_STATUS.TESTING,
  'testing': STORY_STATUS.TESTING,
  'review': STORY_STATUS.TESTING,
  'qa': STORY_STATUS.TESTING,
  'done': STORY_STATUS.DONE,
  'closed': STORY_STATUS.DONE,
  'released': STORY_STATUS.DONE,
  'resolved': STORY_STATUS.DONE,
};

const STATUS_COLORS = {
  [STORY_STATUS.PLANNED]: '#f97316',
  [STORY_STATUS.IN_PROGRESS]: '#3b82f6',
  [STORY_STATUS.TESTING]: '#8b5cf6',
  [STORY_STATUS.DONE]: '#22c55e',
};

// Jendela "baru saja" dipakai dua arah oleh urutan Priority: due date dalam
// N hari ke depan bikin To Do dianggap pekerjaan sekarang (bukan Upcoming),
// dan Done yang selesai dalam N hari terakhir dianggap Recent (bukan Old).
const PRIORITY_RECENT_WINDOW_DAYS = 30;

// Tier urutan default (Priority): epic yang paling butuh perhatian dulu.
// Overdue didahulukan dari status apa pun selama belum Done, karena due date
// yang sudah lewat lebih mendesak daripada status kerjanya sendiri.
const PRIORITY_TIER = {
  OVERDUE: 0,
  IN_PROGRESS: 1,
  IN_REVIEW: 2,
  TODO_CURRENT: 3,
  UPCOMING: 4,
  DONE_RECENT: 5,
  DONE_OLD: 6,
};

const EPIC_FIELDS = [
  'summary', 'description', 'status', 'assignee', 'reporter',
  'duedate', 'created', 'updated', 'components', 'labels',
  'attachment', 'project', 'priority', 'resolutiondate',
];

const CHILD_FIELDS = [
  'summary', 'status', 'priority', 'assignee', 'issuetype',
  'parent', 'customfield_10014', 'duedate', 'created', 'updated', 'resolutiondate',
];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

class RoadmapService {
  constructor() {
    // Fetch stories yang sedang berjalan — dipakai untuk dedup request
    // bersamaan sekaligus refresh di latar belakang.
    this._refreshPromise = null;
  }

  async findAll(query = {}) {
    const start = Date.now();
    const all = await this._getStories();
    const filtered = this._applyFilters(all, query);

    return {
      summary: this._computeSummary(all),
      filterOptions: this._computeFilterOptions(all),
      stories: this._toListItems(filtered),
      meta: {
        total: all.length,
        filtered: filtered.length,
        source: jiraClient.isEnabled ? 'jira' : 'mock',
        executionTimeMs: Date.now() - start,
      },
    };
  }

  async findOne(id) {
    const all = await this._getStories();
    const story = all.find(
      (s) => s.id.toUpperCase() === id.trim().toUpperCase()
    );
    if (!story) return null;

    if (jiraClient.isEnabled) {
      story.activity = await this._getActivity(story);

      if (!Array.isArray(story.children)) {
        try {
          story.children = await this._fetchChildren(story.id, story);
        } catch (err) {
          logger.error(`Failed to fetch child work items for ${story.id}: ${err.message}`, CTX);
          story.children = [];
        }
      }
    }

    return story;
  }

  // Changelog ditarik per klik epic, jadi hasilnya ikut di-cache: tanpa ini
  // setiap buka detail selalu menunggu satu round-trip ke Jira.
  async _getActivity(story) {
    const cacheKey = CACHE_KEYS.ACTIVITY(story.id);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    let activity;
    try {
      activity = this._parseChangelog(await jiraClient.getIssueChangelog(story.id));
    } catch (err) {
      logger.error(`Failed to fetch changelog for ${story.id}: ${err.message}`, CTX);
      return story.activity || [];
    }

    if (story.createdAt && !activity.some((a) => a.action === 'Created')) {
      activity = [
        ...activity,
        {
          action: 'Created',
          user: story.reporter || 'Unknown User',
          date: this._formatDate(story.createdAt),
          timestamp: new Date(story.createdAt).getTime(),
        },
      ].sort((a, b) => b.timestamp - a.timestamp);
    }

    cache.set(cacheKey, activity);
    return activity;
  }

  async getAttachmentStream(attachmentId) {
    if (!jiraClient.isEnabled) {
      throw new Error('Jira not configured');
    }
    return jiraClient.getAttachmentStream(attachmentId);
  }

  // Dipanggil saat server siap supaya user pertama tidak menanggung fetch
  // dingin ke Jira yang memakan beberapa detik.
  warmUp() {
    return this._refreshStories();
  }

  // Cache disegarkan sendiri sebelum TTL habis, jadi request user praktis selalu
  // mengenai data segar dan tidak pernah ikut menunggu Jira. Timer di-unref agar
  // tidak menahan proses saat shutdown.
  startAutoRefresh() {
    const intervalMs = Math.max(config.cacheTtlSeconds - 30, 30) * 1000;
    const timer = setInterval(() => {
      this._refreshStories().catch(() => {});
    }, intervalMs);
    timer.unref?.();

    logger.info(`Auto-refresh every ${Math.round(intervalMs / 1000)}s`, CTX);
    return timer;
  }

  async _getStories() {
    const entry = cache.getStale(CACHE_KEYS.ALL_STORIES);
    if (entry && !entry.isStale) return entry.data;

    // Cache kedaluwarsa: sajikan yang lama dan segarkan di latar belakang.
    // Tanpa ini, klik pertama setelah TTL habis harus menunggu fetch penuh
    // ke Jira (~8 detik) sebelum panel detail muncul.
    if (entry) {
      this._refreshStories();
      return entry.data;
    }

    return this._refreshStories();
  }

  // Satu fetch dipakai bersama semua request yang datang bersamaan, jadi klik
  // beruntun tidak menumpuk panggilan Jira.
  _refreshStories() {
    if (this._refreshPromise) return this._refreshPromise;

    const run = (async () => {
      let stories;
      if (jiraClient.isEnabled) {
        stories = await this._fetchFromJira();
      } else {
        stories = seedStories;
        logger.debug('Using mock data (Jira not configured)', CTX);
      }

      // Child di-stamp & diurutkan dulu (butuh status/completedAt mentah
      // milik parent) supaya newWorkCount di _withDerivedFields tinggal
      // menghitung, bukan mengevaluasi ulang _isNewChild per child.
      stories.forEach((story) => {
        if (Array.isArray(story.children)) story.children = this._sortChildren(story.children, story);
      });
      stories = this._sortStories(this._withDerivedFields(stories));

      cache.set(CACHE_KEYS.ALL_STORIES, stories);
      return stories;
    })();

    this._refreshPromise = run;
    run
      .catch((err) => logger.error(`Background refresh failed: ${err.message}`, CTX))
      .then(() => { if (this._refreshPromise === run) this._refreshPromise = null; });

    return run;
  }

  _withDerivedFields(stories) {
    const today = this._dateKey();
    return stories.map((s) => {
      const anchor = this._dateAnchor(s);
      const isDone = s.status === STORY_STATUS.DONE;
      const due = (s.endDate || '').slice(0, 10);
      const completedAt = (s.completedAt || '').slice(0, 10);
      return {
        ...s,
        effectiveMonthKey: anchor ? anchor.slice(0, 7) : null,
        // Overdue berlaku untuk status apa pun selain Done — To Do, In Progress,
        // maupun In Review yang due date-nya sudah lewat tetap ditandai.
        isOverdue: !isDone && !!due && due < today,
        // Done yang baru selesai setelah due date-nya sendiri tetap ketahuan
        // telat, bukan cuma diam-diam tampil "Done" seperti yang tepat waktu.
        isLateCompletion: isDone && !!due && !!completedAt && completedAt > due,
        completedAtLabel: isDone && s.completedAt ? this._formatDate(s.completedAt) : null,
        newWorkCount: this._countNewWork(s),
      };
    });
  }

  // Epic yang sudah Done tapi kemasukan child baru setelah tanggal selesainya
  // berarti scope-nya nambah belakangan — dihitung "New Work" supaya kelihatan
  // di kartu, bukan cuma diam-diam nempel di progress yang sudah 100%. Children
  // sudah di-stamp `isNew` oleh _sortChildren sebelum fungsi ini dipanggil,
  // jadi tinggal dihitung tanpa mengevaluasi ulang _isNewChild per child.
  _countNewWork(story) {
    const children = story.children || [];
    return children.filter((c) => c.isNew).length;
  }

  // Child dianggap "baru" hanya kalau parent-nya sudah Done dan child itu
  // dibuat setelah tanggal selesai tersebut — scope yang nambah belakangan,
  // bukan sekadar child yang baru dibuat di epic yang masih berjalan. Yang
  // child-nya sendiri sudah Done tidak lagi dianggap "baru" — sudah beres,
  // tidak butuh perhatian ekstra lagi meski awalnya nyelip belakangan.
  _isNewChild(child, parent) {
    if (!parent || parent.status !== STORY_STATUS.DONE) return false;
    if (child.status === STORY_STATUS.DONE) return false;
    const completedAt = (parent.completedAt || '').slice(0, 10);
    if (!completedAt) return false;
    const created = (child.createdAt || child.startDate || '').slice(0, 10);
    return !!created && created > completedAt;
  }

  // Tanggal lokal sebagai string ISO (YYYY-MM-DD) supaya bisa dibandingkan
  // apa adanya dengan due date dari Jira yang formatnya sama.
  _dateKey(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  // Tanggal acuan untuk urutan dan bucket bulan (ISO, sortable apa adanya):
  // Done memakai tanggal selesai, sisanya memakai due date. String kosong
  // berarti epic belum punya tanggal — sengaja tidak dikarang-karang.
  _dateAnchor(story) {
    if (story.status === STORY_STATUS.DONE) {
      return story.completedAt || story.endDate || story.startDate || '';
    }
    return story.endDate || '';
  }

  // Urutan default (Priority): epic yang paling butuh perhatian user di atas.
  // Overdue → In Progress → In Review → To Do (due ≤30 hari) → Upcoming
  // (due jauh atau belum ada tanggal) → Done (selesai ≤30 hari) → Done (lama).
  // Di dalam tier yang belum selesai, deadline terdekat naik dulu; di dalam
  // tier Done, yang paling baru selesai naik dulu.
  _priorityTier(story) {
    const today = this._dateKey();
    const due = (story.endDate || '').slice(0, 10);

    if (story.status === STORY_STATUS.DONE) {
      const completedAt = (story.completedAt || '').slice(0, 10);
      if (!completedAt) return PRIORITY_TIER.DONE_OLD;
      const recentCutoff = this._dateKey(-PRIORITY_RECENT_WINDOW_DAYS);
      return completedAt >= recentCutoff ? PRIORITY_TIER.DONE_RECENT : PRIORITY_TIER.DONE_OLD;
    }

    if (due && due < today) return PRIORITY_TIER.OVERDUE;
    if (story.status === STORY_STATUS.IN_PROGRESS) return PRIORITY_TIER.IN_PROGRESS;
    if (story.status === STORY_STATUS.TESTING) return PRIORITY_TIER.IN_REVIEW;

    if (!due) return PRIORITY_TIER.UPCOMING;
    const soonCutoff = this._dateKey(PRIORITY_RECENT_WINDOW_DAYS);
    return due <= soonCutoff ? PRIORITY_TIER.TODO_CURRENT : PRIORITY_TIER.UPCOMING;
  }

  _sortStories(stories) {
    return stories
      .map((story, index) => ({ story, index }))
      .sort((a, b) => {
        const tierA = this._priorityTier(a.story);
        const tierB = this._priorityTier(b.story);
        if (tierA !== tierB) return tierA - tierB;

        if (tierA >= PRIORITY_TIER.DONE_RECENT) {
          const doneA = a.story.completedAt || '';
          const doneB = b.story.completedAt || '';
          if (doneA !== doneB) return doneB.localeCompare(doneA);
        } else {
          const dateA = a.story.endDate || '';
          const dateB = b.story.endDate || '';
          if (dateA !== dateB) return dateA ? (dateB ? dateA.localeCompare(dateB) : -1) : 1;
        }

        // Sisanya ikut urutan Jira (updated DESC). Dibandingkan lewat index
        // karena Array#sort belum stabil di Node lawas yang jadi target build.
        return a.index - b.index;
      })
      .map(({ story }) => story);
  }

  // Child "baru" (ditambahkan setelah epic Done) naik paling atas — itu yang
  // paling butuh perhatian karena nambah scope belakangan. Di bawahnya, yang
  // belum selesai naik dulu supaya sisa pekerjaan langsung terlihat; Done
  // turun ke dasar, yang paling baru selesai lebih dulu.
  _sortChildren(children, parent) {
    const isDone = (c) => (c.status === STORY_STATUS.DONE ? 1 : 0);

    return children
      .map((child, index) => ({ child: { ...child, isNew: this._isNewChild(child, parent) }, index }))
      .sort((a, b) => {
        const byNew = (b.child.isNew ? 1 : 0) - (a.child.isNew ? 1 : 0);
        if (byNew !== 0) return byNew;

        const byDone = isDone(a.child) - isDone(b.child);
        if (byDone !== 0) return byDone;

        if (isDone(a.child)) {
          const dateA = a.child.completedAt || '';
          const dateB = b.child.completedAt || '';
          if (dateA && dateB && dateA !== dateB) return dateB.localeCompare(dateA);
          if (dateA !== dateB) return dateA ? -1 : 1;
        }

        // Sisanya ikut urutan Jira (created ASC). Dibandingkan lewat index karena
        // Array#sort belum stabil di Node lawas yang jadi target build.
        return a.index - b.index;
      })
      .map(({ child }) => child);
  }

  _formatMonthLabel(monthKey) {
    const [y, m] = monthKey.split('-').map(Number);
    return `${MONTH_NAMES[m - 1]} ${y}`;
  }

  async _fetchFromJira() {
    try {
      const dateFilter = this._buildDateFilter();
      const jql = `project = "IS" AND issuetype = Epic AND ${dateFilter} ORDER BY updated DESC`;
      const issues = await jiraClient.searchIssues(jql, EPIC_FIELDS);

      logger.info(`Fetched ${issues.length} epics from Jira (project IS)`, CTX);
      const epics = issues.map((issue) => this._transformIssue(issue));
      if (epics.length === 0) return epics;

      try {
        const keys = epics.map((e) => e.id).join(', ');
        const childJql = `project = "IS" AND (parent IN (${keys}) OR "Epic Link" IN (${keys})) ORDER BY created ASC`;
        const childIssues = await jiraClient.searchIssues(childJql, CHILD_FIELDS);
        const children = childIssues.map((issue) => this._transformIssue(issue));

        epics.forEach((epic) => {
          epic.children = children.filter(
            (child) => child.parentId === epic.id || child.epicLink === epic.id
          );
        });
      } catch (err) {
        logger.error(`Failed to fetch child work items: ${err.message}`, CTX);
        epics.forEach((epic) => { epic.children = []; });
      }

      epics.forEach((epic) => { epic.progress = this._computeProgress(epic); });
      return epics;
    } catch (err) {
      logger.error(`Jira fetch failed, falling back to mock: ${err.message}`, CTX);
      return seedStories;
    }
  }

  _buildDateFilter() {
    // 400d covers the 12-month backward Release Date window (_bucketByReleaseDate) with
    // margin, since Jira's `updated` timestamp can lag an epic's actual resolutiondate
    // slightly. Epics due in the future are still recent by `updated`, so they come along.
    return 'updated >= -400d';
  }

  async _fetchChildren(epicId, parent) {
    const jql = `project = "IS" AND (parent = "${epicId}" OR "Epic Link" = "${epicId}") ORDER BY created ASC`;
    const issues = await jiraClient.searchIssues(jql, CHILD_FIELDS);
    return this._sortChildren(issues.map((issue) => this._transformIssue(issue)), parent);
  }

  _computeProgress(epic) {
    const children = epic.children || [];
    if (children.length === 0) {
      return epic.status === STORY_STATUS.DONE ? 100 : 0;
    }
    const done = children.filter((c) => c.status === STORY_STATUS.DONE).length;
    return Math.round((done / children.length) * 100);
  }

  _transformIssue(issue) {
    const { key, fields } = issue;
    const tag = this._extractTag(fields);
    const mappedStatus = this._mapStatus(fields.status);
    const createdDate = fields.created || null;
    const dueDate = fields.duedate || null;
    const completedAt = mappedStatus === STORY_STATUS.DONE
      ? (fields.resolutiondate || dueDate || createdDate)
      : null;

    return {
      id: key,
      tag,
      tagColor: this._generateTagColor(tag),
      title: fields.summary || '',
      description: this._extractDescription(fields.description),
      status: mappedStatus,
      statusColor: STATUS_COLORS[mappedStatus] || '#a0aec0',
      priority: fields.priority?.name || '',
      parentId: fields.parent?.key || null,
      epicLink: fields.customfield_10014 || null,
      reporter: fields.reporter?.displayName || null,
      createdAt: createdDate,
      date: dueDate ? this._formatDate(dueDate) : this._formatDate(createdDate),
      startDate: createdDate?.split('T')[0] || '',
      endDate: dueDate || '',
      completedAt: completedAt?.split('T')[0] || '',
      updatedAt: fields.updated || createdDate || null,
      images: (fields.attachment || [])
        .filter((att) => att.mimeType?.startsWith('image/'))
        .map((att) => ({
          id: att.id,
          url: `/api/v1/roadmap/attachment/${att.id}`,
          filename: att.filename,
        })),
      assignee: fields.assignee?.displayName || 'Unassigned',
      assigneeAvatarUrl: fields.assignee?.avatarUrls?.['24x24'] || fields.assignee?.avatarUrls?.['48x48'] || null,
      issueType: fields.issuetype?.name || '',
      issueTypeIconUrl: fields.issuetype?.iconUrl || null,
      priorityIconUrl: fields.priority?.iconUrl || null,
      dueDate: dueDate ? this._formatDate(dueDate) : '-',
      activity: [],
    };
  }

  _mapStatus(statusField) {
    const name = (statusField?.name || '').toLowerCase();
    if (STATUS_MAP[name]) return STATUS_MAP[name];

    const category = statusField?.statusCategory?.key;
    if (category === 'done') return STORY_STATUS.DONE;
    if (category === 'indeterminate') return STORY_STATUS.IN_PROGRESS;
    return STORY_STATUS.PLANNED;
  }

  _extractTag(fields) {
    if (fields.components?.length > 0) return fields.components[0].name;
    if (fields.labels?.length > 0) return fields.labels[0];
    return fields.project?.key || 'Untagged';
  }

  _extractDescription(adf) {
    if (!adf) return '';
    if (typeof adf === 'string') return adf;
    const extractText = (node) => {
      if (!node) return '';
      if (node.text) return node.text;
      if (node.content) return node.content.map(extractText).join('');
      return '';
    };
    return adf.content ? adf.content.map(extractText).join('\n').trim() : '';
  }

  _generateTagColor(tagName) {
    const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_COLORS[hash % TAG_COLORS.length];
  }

  _formatDate(isoDate) {
    if (!isoDate) return '-';
    const d = new Date(isoDate);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  _parseChangelog(changelogValues) {
    if (!Array.isArray(changelogValues)) return [];
    const activities = [];

    for (const log of changelogValues) {
      const statusItem = log.items?.find((i) => i.field === 'status');
      if (statusItem) {
        const date = new Date(log.created);
        activities.push({
          action: `Changed status from ${statusItem.fromString} to ${statusItem.toString}`,
          user: log.author?.displayName || 'Unknown User',
          date: `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
          timestamp: date.getTime(),
        });
      }
    }

    return activities.sort((a, b) => b.timestamp - a.timestamp);
  }

  _applyFilters(stories, { status, project, search, month } = {}) {
    let result = stories;

    const statuses = [].concat(status || []).filter(Boolean).map((s) => s.toLowerCase());
    if (statuses.length) {
      result = result.filter((r) => statuses.includes(r.status.toLowerCase()));
    }

    const categories = [].concat(project || []).filter(Boolean).map((p) => p.toLowerCase());
    if (categories.length) {
      result = result.filter((r) => categories.includes(r.tag.toLowerCase()));
    }

    if (month) {
      result = result.filter((r) => r.effectiveMonthKey === month);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter((r) => this._searchText(r).includes(q));
    }
    return result;
  }

  _searchText(story) {
    return [story.id, story.title, story.tag, story.description, story.assignee, story.status]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  _computeSummary(stories) {
    const count = (status) => stories.filter((s) => s.status === status).length;
    return {
      total: stories.length,
      planned: count(STORY_STATUS.PLANNED),
      inProgress: count(STORY_STATUS.IN_PROGRESS),
      testing: count(STORY_STATUS.TESTING),
      done: count(STORY_STATUS.DONE),
    };
  }

  _computeFilterOptions(stories) {
    return {
      statuses: this._bucketByStatus(stories),
      categories: this._bucketByCategory(stories),
      releaseDates: this._bucketByReleaseDate(stories),
    };
  }

  _bucketByStatus(stories) {
    return [STORY_STATUS.PLANNED, STORY_STATUS.IN_PROGRESS, STORY_STATUS.TESTING, STORY_STATUS.DONE]
      .map((status) => ({
        value: status,
        label: status,
        color: STATUS_COLORS[status],
        count: stories.filter((s) => s.status === status).length,
      }));
  }

  _bucketByCategory(stories) {
    const counts = new Map();
    const colors = new Map();
    stories.forEach((s) => {
      counts.set(s.tag, (counts.get(s.tag) || 0) + 1);
      colors.set(s.tag, s.tagColor);
    });
    return [...counts.entries()]
      .map(([tag, count]) => ({ value: tag, label: tag, color: colors.get(tag), count }))
      .sort((a, b) => b.count - a.count);
  }

  _bucketByReleaseDate(stories) {
    const now = new Date();
    const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    // Due date epic yang sedang berjalan kerap jatuh di bulan depan, jadi jendela
    // bucket ikut memanjang ke depan sejauh data — dibatasi 12 bulan supaya satu
    // due date nyasar tidak melahirkan puluhan bucket kosong.
    const first = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const maxAhead = keyOf(new Date(now.getFullYear(), now.getMonth() + 12, 1));
    let lastKey = keyOf(now);
    stories.forEach((s) => {
      const key = s.effectiveMonthKey;
      if (key && key > lastKey && key <= maxAhead) lastKey = key;
    });

    const buckets = [];
    for (let d = new Date(first); keyOf(d) <= lastKey; d.setMonth(d.getMonth() + 1)) {
      const key = keyOf(d);
      buckets.push({ value: key, label: this._formatMonthLabel(key), count: 0 });
    }

    const byKey = new Map(buckets.map((b) => [b.value, b]));
    stories.forEach((s) => {
      const bucket = byKey.get(s.effectiveMonthKey);
      if (bucket) bucket.count += 1;
    });
    return buckets;
  }

  _toListItems(stories) {
    return stories.map(({ activity, children, ...rest }) => rest);
  }
}

module.exports = new RoadmapService();
