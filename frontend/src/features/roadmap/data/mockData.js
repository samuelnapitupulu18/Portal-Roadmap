// Centralized mock data for all views

export const mockTasks = [
  {
    id: 'IS-11644',
    tag: 'TRACK2TICKET',
    tagColor: '#63b3ed',
    title: 'Enterprise invoice disputes are hard to track',
    description: "Currently there's no centralized way to track and manage enterprise-level invoice disputes. This creates confusion and delays in resolution.",
    status: 'Planned',
    statusColor: '#ed8936',
    date: '24 Apr 2026',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    images: false,
    assignee: 'TRACK2TICKET',
    dueDate: '24 Apr 2026',
    activity: [
      { action: 'Changed status from In Progress to Testing', user: 'Sean Dore', date: '12 Mar 2026' },
      { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '1 Feb 2026' },
    ]
  },
  {
    id: 'IS-11645',
    tag: 'IS-FINANCE MAN',
    tagColor: '#d69e2e',
    title: 'Customers miss shipped improvements',
    description: "Users are unaware of new features and improvements, leading to low adoption rates and support tickets for existing functionality.",
    status: 'In Progress',
    statusColor: '#3182ce',
    date: '24 Mei 2026',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    images: false,
    assignee: 'IS-FINANCE MAN',
    dueDate: '24 Mei 2026',
    activity: [
      { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '1 Apr 2026' },
    ]
  },
  {
    id: 'IS-11646',
    tag: 'FORM REGISTRASI IS5',
    tagColor: '#68d391',
    title: 'Customers cannot self-manage subscription changes',
    description: "Customer portal lacks functionality for users to upgrade, downgrade, or modify their subscription plans without contacting support.",
    status: 'In Progress',
    statusColor: '#3182ce',
    date: '29 Mei 2026',
    startDate: '2026-05-10',
    endDate: '2026-06-15',
    images: false,
    assignee: 'FORM REGISTRASI IS5',
    dueDate: '29 Mei 2026',
    activity: [
      { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '10 Mar 2026' },
    ]
  },
  {
    id: 'IS-11647',
    tag: 'IS - TOP MANAGEMENT',
    tagColor: '#ed8936',
    title: 'Duplicate feedback lowers signal quality',
    description: "",
    status: 'Planned',
    statusColor: '#ed8936',
    date: '26 Apr 2026',
    startDate: '2026-04-10',
    endDate: '2026-05-15',
    images: true,
    assignee: 'IS - TOP MANAGEMENT',
    dueDate: '26 Apr 2026',
    activity: [
      { action: 'Changed status from In Progress to Testing', user: 'Sean Dore', date: '15 Mar 2026' },
      { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '1 Feb 2026' },
    ]
  },
  {
    id: 'IS-11648',
    tag: 'TRACK2TICKET',
    tagColor: '#63b3ed',
    title: 'Sales Opportunity List Enhancement - Funnel',
    description: "Funnel to display Opportunity Count and Expected Amount by Stage Target to improve pipeline visibility and forecasting accuracy.",
    status: 'Released / Done',
    statusColor: '#48bb78',
    date: '28 Aug 2026',
    startDate: '2026-07-01',
    endDate: '2026-08-28',
    images: false,
    assignee: 'TRACK2TICKET',
    dueDate: '28 Aug 2026',
    activity: [
      { action: 'Changed status from Testing to Done', user: 'Sean Dore', date: '28 Aug 2026' },
      { action: 'Changed status from In Progress to Testing', user: 'Sean Dore', date: '15 Jul 2026' },
      { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '1 Jul 2026' },
    ]
  },
  {
    id: 'IS-11643',
    tag: 'TTB DIGITAL',
    tagColor: '#ed64a6',
    title: 'GPS Tracking Enhancements: Empower SMS notifications, Auto stop Travel timer when entering geofence, Rooftop GPS Coordinates to improve field team efficiency.',
    description: "-",
    status: 'Released / Done',
    statusColor: '#48bb78',
    date: '24 Jun 2026',
    startDate: '2026-06-01',
    endDate: '2026-06-24',
    images: false,
    assignee: 'TTB DIGITAL',
    dueDate: '24 Jun 2026',
    activity: [
      { action: 'Changed status from Testing to Done', user: 'Sean Dore', date: '24 Jun 2026' },
      { action: 'Changed status from In Progress to Testing', user: 'Sean Dore', date: '10 Jun 2026' },
      { action: 'Changed status from Planned to In Progress', user: 'Sean Dore', date: '1 Jun 2026' },
    ]
  },
]

// Unique status values for filter
export const statusOptions = ['Planned', 'In Progress', 'Testing', 'Released / Done']

// Unique project/tag values for filter
export const projectOptions = [...new Set(mockTasks.map(t => t.tag))]
