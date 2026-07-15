const axios = require('axios');
const { config } = require('../config');
const logger = require('./Logger');

const CTX = 'JiraClient';

class JiraClient {
  constructor() {
    const { baseUrl, apiEmail, apiToken } = config.jira;

    this._enabled = !!(baseUrl && apiEmail && apiToken);

    if (!this._enabled) {
      logger.warn('Jira credentials not configured — using mock data', CTX);
    }

    this._http = axios.create({
      baseURL: baseUrl,
      auth: { username: apiEmail, password: apiToken },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 30_000,
    });
  }

  get isEnabled() {
    return this._enabled;
  }

  async searchIssues(jql, fields = ['*all']) {
    if (!this._enabled) return [];

    let allIssues = [];
    let nextPageToken = null;

    try {
      do {
        logger.debug(`JQL: ${jql} (page: ${nextPageToken || 'first'})`, CTX);

        const params = { jql, fields: fields.join(','), maxResults: 100 };
        if (nextPageToken) params.nextPageToken = nextPageToken;

        const { data } = await this._http.get('/rest/api/3/search/jql', { params });

        allIssues = allIssues.concat(data.issues || []);
        nextPageToken = data.nextPageToken || null;
      } while (nextPageToken);

      logger.info(`Fetched ${allIssues.length} issues from Jira`, CTX);
      return allIssues;
    } catch (err) {
      logger.error(`Search issues failed: ${err.message}`, CTX);
      throw err;
    }
  }

  async getIssueChangelog(issueIdOrKey) {
    if (!this._enabled) return [];
    try {
      const { data } = await this._http.get(`/rest/api/3/issue/${issueIdOrKey}/changelog`);
      return data.values || [];
    } catch (err) {
      logger.error(`Get changelog for ${issueIdOrKey} failed: ${err.message}`, CTX);
      throw err;
    }
  }

  async getAttachmentStream(attachmentId) {
    if (!this._enabled) throw new Error('Jira not configured');
    try {
      const response = await this._http.get(`/rest/api/3/attachment/content/${attachmentId}`, {
        responseType: 'stream',
      });
      return {
        stream: response.data,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
      };
    } catch (err) {
      logger.error(`Get attachment ${attachmentId} failed: ${err.message}`, CTX);
      throw err;
    }
  }
}

module.exports = new JiraClient();
