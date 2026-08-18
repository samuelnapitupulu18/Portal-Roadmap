import React from 'react'
import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function EpicCard({
  title,
  description,
  status,
  statusColor,
  progress = 0,
  tag,
  tagColor,
  expectedLabel,
  completedAtLabel,
  onClick,
  onPrefetch,
}) {
  const isPlanned = status === 'To Do'
  const isDone = status === 'Done'
  const hasCategory = tag && tag !== '-'
  const dateLabel = isDone ? completedAtLabel : expectedLabel
  const datePrefix = isDone ? 'Done' : 'Expected'

  return (
    <Card
      className="bg-white border-0 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
    >
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between gap-2 mb-4">
          {hasCategory ? (
            <span
              className="text-[9px] uppercase font-bold tracking-wider rounded border px-2 py-0.5"
              style={{ borderColor: tagColor, color: tagColor }}
            >
              {tag}
            </span>
          ) : <span />}
          <span
            className="text-[11px] font-semibold tracking-wide rounded-full px-2.5 py-1 whitespace-nowrap"
            style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
          >
            {status}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-4 flex-1">
            {description}
          </p>
        )}

        <div className="mt-auto">
          {!isPlanned && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-700">{progress}% complete</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: statusColor }}
                />
              </div>
            </div>
          )}
          {dateLabel && (
            <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100 text-xs font-medium text-gray-500">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              {datePrefix}: {dateLabel}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
