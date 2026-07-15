/**
 * @fileoverview Type definitions for the Roadmap feature domain.
 * Using JSDoc for type safety without requiring TypeScript compilation.
 */

/**
 * @typedef {Object} ActivityItem
 * @property {string} action   - Description of the status change (e.g. "Changed status from Planned to In Progress")
 * @property {string} user     - Name of the person who made the change
 * @property {string} date     - Human-readable date string (e.g. "12 Mar 2026")
 */

/**
 * @typedef {Object} RoadmapTask
 * @property {string}  id          - Jira issue key (e.g. "IS-11644")
 * @property {string}  tag         - Project/group tag label (e.g. "TRACK2TICKET")
 * @property {string}  tagColor    - Hex color for the tag badge
 * @property {string}  title       - Task title / summary
 * @property {string}  description - Detailed task description
 * @property {string}  status      - Current status: "Planned" | "In Progress" | "Testing" | "Released / Done"
 * @property {string}  statusColor - Hex color for the status indicator
 * @property {string}  date        - Display date string (e.g. "24 Apr 2026")
 * @property {string}  startDate   - ISO date for timeline start (e.g. "2026-04-01")
 * @property {string}  endDate     - ISO date for timeline end (e.g. "2026-04-30")
 * @property {boolean} images      - Whether the task has image attachments
 * @property {string}  assignee    - Assignee name or group
 * @property {string}  dueDate     - Due date display string
 * @property {ActivityItem[]} activity - Chronological activity/history entries
 */

/**
 * @typedef {'Planned' | 'In Progress' | 'Testing' | 'Released / Done'} TaskStatus
 */

/**
 * @typedef {'cards' | 'timeline'} ViewMode
 */

/**
 * @typedef {Object} FilterState
 * @property {string} status   - Selected status filter (empty string = all)
 * @property {string} project  - Selected project/tag filter (empty string = all)
 * @property {string} month    - Selected month filter (empty string = all)
 * @property {string} search   - Search query string
 */

/**
 * @typedef {Object} TaskGroup
 * @property {string}       tag      - Group tag name
 * @property {string}       tagColor - Group tag color
 * @property {RoadmapTask[]} tasks   - Tasks belonging to this group
 */

/**
 * @typedef {Object} MonthColumn
 * @property {string} key   - Month key in "YYYY-MM" format
 * @property {string} label - Human-readable month label (e.g. "Apr 2026")
 */

/**
 * @typedef {Object} StatItem
 * @property {string} label - Stat label (e.g. "Total Work")
 * @property {number} count - Stat count value
 */

// Export empty object to make this a module
export default {}
