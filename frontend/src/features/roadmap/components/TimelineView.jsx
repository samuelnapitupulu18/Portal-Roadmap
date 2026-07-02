import React from 'react'
import { Badge } from '@/components/ui/badge'

// Generate month columns from tasks
function getMonthColumns(tasks) {
  const months = [
    { key: '2026-04', label: 'Apr 2026' },
    { key: '2026-05', label: 'May 2026' },
    { key: '2026-06', label: 'Jun 2026' },
    { key: '2026-07', label: 'Jul 2026' },
    { key: '2026-08', label: 'Aug 2026' },
  ]
  return months
}

// Group tasks by their tag
function groupTasksByTag(tasks) {
  const grouped = {}
  tasks.forEach((task) => {
    if (!grouped[task.tag]) {
      grouped[task.tag] = {
        tag: task.tag,
        tagColor: task.tagColor,
        tasks: [],
      }
    }
    grouped[task.tag].tasks.push(task)
  })
  return Object.values(grouped)
}

// Check if a task falls in a specific month
function getTasksInMonth(tasks, monthKey) {
  return tasks.filter((task) => {
    const start = task.startDate
    const end = task.endDate
    const monthStart = monthKey + '-01'
    const monthEnd = monthKey + '-31'
    return start <= monthEnd && end >= monthStart
  })
}

export function TimelineView({ tasks, onTaskClick }) {
  const months = getMonthColumns(tasks)
  const groups = groupTasksByTag(tasks)

  return (
    <div className="px-16 pb-8 overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Header Row */}
          <div className="grid grid-cols-[200px_repeat(5,1fr)] border-b border-gray-200 bg-gray-50">
            <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">
              Stories
            </div>
            {months.map((month) => (
              <div
                key={month.key}
                className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 last:border-r-0"
              >
                {month.label}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {groups.map((group, groupIdx) => (
            <div
              key={group.tag}
              className={`grid grid-cols-[200px_repeat(5,1fr)] border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors`}
            >
              {/* Tag Label */}
              <div className="px-4 py-4 border-r border-gray-200 flex items-start">
                <Badge
                  className="text-[9px] uppercase font-bold tracking-wider rounded border-0 whitespace-nowrap"
                  style={{ backgroundColor: group.tagColor, color: '#fff' }}
                >
                  {group.tag}
                </Badge>
              </div>

              {/* Month Cells */}
              {months.map((month) => {
                const tasksInMonth = getTasksInMonth(group.tasks, month.key)
                return (
                  <div
                    key={month.key}
                    className="px-2 py-3 border-r border-gray-100 last:border-r-0 min-h-[64px]"
                  >
                    {tasksInMonth.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick && onTaskClick(task)}
                        className="w-full text-left mb-1.5 last:mb-0 group cursor-pointer"
                      >
                        <div className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-md px-2.5 py-2 transition-colors">
                          <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-green-800">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: task.statusColor }}
                            />
                            <span className="text-[10px] text-gray-500">
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Empty state */}
          {groups.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              No items to display in the timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
