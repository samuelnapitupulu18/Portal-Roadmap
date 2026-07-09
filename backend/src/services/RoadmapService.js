/**
 * @module services/RoadmapService
 * @description THICK service — all business logic for roadmap stories.
 *
 * Fetches stories from Jira (all statuses, NOT just Done).
 * Falls back to seed data if Jira is not configured.
 */

const jiraClient = require('../lib/JiraClient');
const cache = require('./CacheService');
const seedStories = require('../data/stories.seed');
const { STORY_STATUS, CACHE_KEYS } = require('../config');
const logger = require('../lib/Logger');

const CTX = 'RoadmapService';
const MS_PER_DAY = 86_400_000;

// Tag color palette (generated from tag name hash)
const TAG_COLORS = [
  '#63b3ed', '#d69e2e', '#68d391', '#ed8936',
  '#ed64a6', '#9f7aea', '#f56565', '#4fd1c5',
];

// Map Jira status names → our status constants
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

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
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

    if (story && jiraClient.isEnabled) {
      try {
        const changelog = await jiraClient.getIssueChangelog(story.id);
        story.activity = this._parseChangelog(changelog);
      } catch (err) {
        logger.error(`Failed to fetch changelog for ${story.id}: ${err.message}`, CTX);
      }
    }

    return story ? this._enrichDetail(story) : null;
  }

  async getAttachmentStream(attachmentId) {
    if (!jiraClient.isEnabled) {
      throw new Error('Jira not configured');
    }
    return jiraClient.getAttachmentStream(attachmentId);
  }

  async _getStories(query) {
    const cacheKey = CACHE_KEYS.ALL_STORIES(`${query.month || ''}-${query.year || ''}`);
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
      let dateFilter = 'updated >= -180d'; // default to last 6 months
      
      const { month, year } = query;
      let y, m;

      if (year && year !== 'All Years') {
        y = parseInt(year);
      }
      if (month && month !== 'All Months') {
        m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(month) + 1;
      }

      if (y && m) {
        const since = `${y}-${String(m).padStart(2, '0')}-01`;
        const until = `${y}-${String(m).padStart(2, '0')}-31`;
        dateFilter = `updated >= "${since}" AND updated <= "${until}"`;
      } else if (y) {
        const since = `${y}-01-01`;
        const until = `${y}-12-31`;
        dateFilter = `updated >= "${since}" AND updated <= "${until}"`;
      } else if (m) {
        const currYear = new Date().getFullYear();
        const since = `${currYear}-${String(m).padStart(2, '0')}-01`;
        const until = `${currYear}-${String(m).padStart(2, '0')}-31`;
        dateFilter = `updated >= "${since}" AND updated <= "${until}"`;
      }

      // Fetch issues that are NOT Done and match the date filter
      const jql = `statusCategory != Done AND ${dateFilter} ORDER BY updated DESC`;
      const issues = await jiraClient.searchIssues(jql, [
        'summary', 'description', 'status', 'assignee',
        'duedate', 'created', 'components', 'labels',
        'attachment', 'project', 'priority',
      ]);

      logger.info(`Fetched ${issues.length} roadmap issues from Jira`, CTX);
      return issues.map((issue) => this._transformIssue(issue));
    } catch (err) {
      logger.error(`Jira fetch failed, falling back to mock: ${err.message}`, CTX);
      return seedStories;
    }
  }

  _transformIssue(issue) {
    const { key, fields } = issue;
    const tag = this._extractTag(fields);
    const mappedStatus = this._mapStatus(fields.status?.name);
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
      date: dueDate ? this._formatDate(dueDate) : this._formatDate(createdDate),
      startDate: createdDate?.split('T')[0] || '',
      endDate: dueDate || '',
      images: (fields.attachment || []).filter(att => att.mimeType?.startsWith('image/')).map(att => ({
        id: att.id,
        url: `/api/v1/roadmap/attachment/${att.id}`,
        filename: att.filename
      })),
      assignee: fields.assignee?.displayName || fields.project?.name || 'Unassigned',
      dueDate: dueDate ? this._formatDate(dueDate) : '-',
      activity: [],
    };
  }

  _mapStatus(jiraStatusName = '') {
    return STATUS_MAP[jiraStatusName.toLowerCase()] || STORY_STATUS.PLANNED;
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
      const statusItem = log.items?.find(i => i.field === 'status');
      if (statusItem) {
        const date = new Date(log.created);
        const dateStr = `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
        
        activities.push({
          action: `Changed status from ${statusItem.fromString} to ${statusItem.toString}`,
          user: log.author?.displayName || 'Unknown User',
          date: dateStr,
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
    return stories.map(({ activity, dueDate, ...rest }) => rest);
  }

  _enrichDetail(story) {
    return {
      ...story,
      durationDays: Math.ceil(
        (new Date(story.endDate) - new Date(story.startDate)) / MS_PER_DAY
      ),
      isOverdue: story.status !== STORY_STATUS.DONE && new Date(story.endDate) < new Date(),
      activityCount: story.activity?.length ?? 0,
      lastActivity: story.activity?.[0] ?? null,
    };
  }
}

module.exports = new RoadmapService();
