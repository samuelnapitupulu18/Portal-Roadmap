import React from 'react'
import { Calendar, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function TaskCard({
  id,
  tag,
  tagColor,
  title,
  description,
  images,
  status,
  statusColor,
  date,
  onClick,
}) {
  return (
    <Card
      className="bg-white border-0 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
            {id}
          </span>
          <Badge
            className="text-[10px] uppercase font-bold tracking-wider rounded border-0"
            style={{ backgroundColor: tagColor, color: '#fff' }}
          >
            {tag}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-3">
          {title}
        </h3>

        {/* Content */}
        <div className="flex-1 mb-6">
          {description && (
            <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}

          {images && (
            <div className="flex gap-2 mt-2">
              {[1, 2, 3].map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 aspect-video bg-gray-500 rounded flex items-center justify-center"
                >
                  <ImageIcon className="text-white/50 h-6 w-6" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs font-medium mt-auto pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            <span style={{ color: statusColor }}>{status}</span>
          </div>
          <div className="flex items-center text-green-600/80">
            <Calendar className="mr-1 h-3.5 w-3.5" />
            {date}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
