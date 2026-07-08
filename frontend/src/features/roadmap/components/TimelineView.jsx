import React from 'react'
import { Badge } from '@/components/ui/badge'

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Generate month columns dynamically for the last 6 months. */
function getMonthColumns(selectedMonth) {
  const columns = []
  let targetDate = new Date()

  if (selectedMonth && selectedMonth !== 'All Months') {
    const m = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ].indexOf(selectedMonth)
    
    if (m !== -1) {
      targetDate = new Date(targetDate.getFullYear(), m, 1)
      
      // If a specific month is selected, only show that ONE month.
      columns.push({
        key: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`,
        label: `${MONTH_LABELS[targetDate.getMonth()]} ${targetDate.getFullYear()}`,
      })
      return columns
    }
  }
  
  // Start from 5 months ago relative to targetDate
  const cursor = new Date(targetDate.getFullYear(), targetDate.getMonth() - 5, 1)

  for (let i = 0; i < 6; i++) {
    const y = cursor.getFullYear()
    const m = cursor.getMonth()
    columns.push({
      key: `${y}-${String(m + 1).padStart(2, '0')}`,
      label: `${MONTH_LABELS[m]} ${y}`,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return columns
}

/** Group tasks by their tag/project. */
function groupTasksByTag(tasks) {
  const grouped = {}
  tasks.forEach((task) => {
    if (!grouped[task.tag]) {
      grouped[task.tag] = { tag: task.tag, tagColor: task.tagColor, tasks: [] }
    }
    grouped[task.tag].tasks.push(task)
  })
  return Object.values(grouped).sort((a, b) => b.tasks.length - a.tasks.length)
}

/** Filter tasks that overlap a given month. */
function getTasksInMonth(tasks, monthKey) {
  const monthStart = monthKey + '-01'
  const monthEnd = monthKey + '-31'

  return tasks.filter((task) => {
    let start = task.startDate || ''
    let end = task.endDate || task.startDate || ''

    // Fallback to updatedDate if neither start nor end is present
    if (!start && !end && task.updatedDate) {
      start = task.updatedDate
      end = task.updatedDate
    }

    if (!start) return false
    return start <= monthEnd && end >= monthStart
  })
}

function TimelineCell({ tasks, monthKey, onTaskClick }) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const displayTasks = isExpanded ? tasks : tasks.slice(0, 3)
  const hasMore = tasks.length > 3

  return (
    <div className="px-2 py-3 border-r border-gray-100 last:border-r-0 min-h-[64px]">
      {displayTasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onTaskClick && onTaskClick(task)}
          className="w-full text-left mb-1.5 last:mb-0 group cursor-pointer"
        >
          <div className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-md px-2.5 py-2 transition-colors">
            <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-green-800">
              {task.title}
            </p>
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.statusColor }}
                />
                <span className="text-[10px] text-gray-500 font-medium">
                  {task.status}
                </span>
              </div>
              <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">
                {task.date}
              </span>
            </div>
          </div>
        </button>
      ))}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-[10px] text-gray-500 hover:text-green-700 hover:bg-green-50 rounded py-1 text-center mt-1 transition-colors font-medium cursor-pointer"
        >
          {isExpanded ? 'Show less' : `+${tasks.length - 3} more`}
        </button>
      )}
    </div>
  )
}

export function TimelineView({ tasks, onTaskClick, selectedMonth }) {
  const months = getMonthColumns(selectedMonth)
  const groups = groupTasksByTag(tasks)

  const colCount = months.length || 1

  return (
    <div className="px-16 pb-8 overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Header Row */}
          <div
            className="border-b border-gray-200 bg-gray-50"
            style={{ display: 'grid', gridTemplateColumns: `200px repeat(${colCount}, 1fr)` }}
          >
            <div className="px-4 py-3 text-xs font-bold text-[#1a1f36] uppercase tracking-wider border-r border-gray-200">
              Area
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

          {/* Data Rows — show max 50 groups to avoid rendering explosion */}
          {groups.slice(0, 50).map((group) => (
            <div
              key={group.tag}
              className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
              style={{ display: 'grid', gridTemplateColumns: `200px repeat(${colCount}, 1fr)` }}
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
                  <TimelineCell 
                    key={month.key} 
                    monthKey={month.key} 
                    tasks={tasksInMonth} 
                    onTaskClick={onTaskClick} 
                  />
                )
              })}
            </div>
          ))}

          {groups.length > 50 && (
            <div className="px-6 py-3 text-center text-gray-400 text-xs border-t border-gray-200">
              Showing 50 of {groups.length} projects. Use filters to narrow down.
            </div>
          )}

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
