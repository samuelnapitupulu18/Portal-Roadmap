import { registerAs } from '@nestjs/config';

export default registerAs('jira', () => ({
  baseUrl: process.env.JIRA_BASE_URL || 'https://your-org.atlassian.net',
  apiEmail: process.env.JIRA_API_EMAIL || '',
  apiToken: process.env.JIRA_API_TOKEN || '',
  projectKey: process.env.JIRA_PROJECT_KEY || 'NUSA',
  boardId: process.env.JIRA_BOARD_ID || '123',
}));
