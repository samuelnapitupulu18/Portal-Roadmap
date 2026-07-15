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
  assignee,
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

          {images && images.length > 0 && (
            <div className="flex gap-2 mt-2">
              {images.slice(0, 3).map((img, idx) => (
                <div
                  key={idx}
                  className="flex-1 aspect-[4/3] bg-[#666666] rounded flex items-center justify-center relative overflow-hidden group"
                  title={img.filename}
                >
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${img.url}`}
                    alt={img.filename}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {idx === 2 && images.length > 3 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-sm">
                      +{images.length - 3}
                    </div>
                  )}
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
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center text-green-600/80">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              {date}
            </div>
            {assignee && (
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                {assignee}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
