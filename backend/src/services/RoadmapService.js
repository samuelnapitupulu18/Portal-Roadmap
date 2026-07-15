const jiraClient = require('../lib/JiraClient');
const cache = require('./CacheService');
const seedStories = require('../data/stories.seed');
const { STORY_STATUS, CACHE_KEYS } = require('../config');
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
  [STORY_STATUS.PLANNED]: '#ed8936',
  [STORY_STATUS.IN_PROGRESS]: '#3182ce',
  [STORY_STATUS.TESTING]: '#9f7aea',
  [STORY_STATUS.DONE]: '#48bb78',
};

const EPIC_FIELDS = [
  'summary', 'description', 'status', 'assignee', 'reporter',
  'duedate', 'created', 'components', 'labels',
  'attachment', 'project', 'priority',
];

const CHILD_FIELDS = [
  'summary', 'status', 'priority', 'assignee', 'issuetype',
  'parent', 'customfield_10014', 'duedate', 'created',
];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

class RoadmapService {
  async findAll(query = {}) {
    const start = Date.now();
    const all = await this._getStories(query);
    const filtered = this._applyFilters(all, query);

    return {
      summary: this._computeSummary(all),
      filterOptions: this._extractFilterOptions(all),
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
      try {
        const changelog = await jiraClient.getIssueChangelog(story.id);
        story.activity = this._parseChangelog(changelog);
      } catch (err) {
        logger.error(`Failed to fetch changelog for ${story.id}: ${err.message}`, CTX);
      }

      if (story.createdAt && !(story.activity || []).some((a) => a.action === 'Created')) {
        story.activity = [
          ...(story.activity || []),
          {
            action: 'Created',
            user: story.reporter || 'Unknown User',
            date: this._formatDate(story.createdAt),
            timestamp: new Date(story.createdAt).getTime(),
          },
        ].sort((a, b) => b.timestamp - a.timestamp);
      }

      if (!Array.isArray(story.children)) {
        try {
          story.children = await this._fetchChildren(story.id);
        } catch (err) {
          logger.error(`Failed to fetch child work items for ${story.id}: ${err.message}`, CTX);
          story.children = [];
        }
      }
    }

    return story;
  }

  async getAttachmentStream(attachmentId) {
    if (!jiraClient.isEnabled) {
      throw new Error('Jira not configured');
    }
    return jiraClient.getAttachmentStream(attachmentId);
  }

  async _getStories(query = {}) {
    const cacheKey = CACHE_KEYS.ALL_STORIES(query.month || '');
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    let stories;
    if (jiraClient.isEnabled) {
      stories = await this._fetchFromJira(query);
    } else {
      stories = seedStories;
      logger.debug('Using mock data (Jira not configured)', CTX);
    }

    cache.set(cacheKey, stories);
    return stories;
  }

  async _fetchFromJira(query) {
    try {
      const dateFilter = this._buildDateFilter(query);
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

  _buildDateFilter({ month } = {}) {
    const m = month && month !== 'All Months' ? FULL_MONTHS.indexOf(month) + 1 : 0;
    if (!m) return 'updated >= -180d';

    const year = new Date().getFullYear();
    const mm = String(m).padStart(2, '0');
    return `updated >= "${year}-${mm}-01" AND updated <= "${year}-${mm}-31"`;
  }

  async _fetchChildren(epicId) {
    const jql = `project = "IS" AND (parent = "${epicId}" OR "Epic Link" = "${epicId}") ORDER BY created ASC`;
    const issues = await jiraClient.searchIssues(jql, CHILD_FIELDS);
    return issues.map((issue) => this._transformIssue(issue));
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

  _applyFilters(stories, { status, project, search }) {
    let result = stories;
    if (status) {
      const s = status.toLowerCase();
      result = result.filter((r) => r.status.toLowerCase() === s);
    }
    if (project) {
      const p = project.toLowerCase();
      result = result.filter((r) => r.tag.toLowerCase() === p);
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

  _extractFilterOptions(stories) {
    return {
      statuses: [...new Set(stories.map((s) => s.status))].sort(),
      projects: [...new Set(stories.map((s) => s.tag))].sort(),
    };
  }

  _toListItems(stories) {
    return stories.map(({ activity, children, ...rest }) => rest);
  }
}

module.exports = new RoadmapService();
