import React from 'react'
import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function EpicCard({
  title,
  description,
  status,
  statusColor,
  progress = 0,
  dueDate,
  onClick,
}) {
  const hasDueDate = dueDate && dueDate !== '-'
  return (
    <Card
      className="bg-white border-0 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col h-full">
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-3">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-6 flex-1">
            {description}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusColor }}
              />
              <span className="text-sm font-medium" style={{ color: statusColor }}>
                {status}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: statusColor }}
            />
          </div>
          {hasDueDate && (
            <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-gray-500">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              Due {dueDate}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
