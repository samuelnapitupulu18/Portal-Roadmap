import React from 'react'
import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const PROGRESS_LABEL = {
  'In Progress': 'Progress',
  'On Hold': 'Complete',
}

const STATUS_BADGE_CLASS = {
  'To Do': 'bg-orange-100 text-orange-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'On Hold': 'bg-violet-100 text-violet-700',
  'Done': 'bg-emerald-100 text-emerald-700',
}

export function EpicCard({
  title,
  description,
  status,
  statusColor,
  progress = 0,
  tag,
  tagColor,
  completedAtLabel,
  newWorkCount = 0,
  onClick,
  onPrefetch,
}) {
  const isDone = status === 'Done'
  const hasCategory = tag && tag !== '-'
  // Progress bar cuma relevan untuk pekerjaan yang sedang berjalan — To Do
  // belum mulai dan Done sudah tuntas, jadi persentase tidak menambah info.
  const showProgress = status === 'In Progress' || status === 'On Hold'
  const showDoneRow = isDone && (completedAtLabel || newWorkCount > 0)

  return (
    <Card
      className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
    >
      <CardContent className="p-0 flex flex-col h-full">
        <div className="flex items-center justify-between px-5 pt-5">
          {hasCategory ? (
            <span
              className="inline-flex items-center rounded-[6px] border bg-white px-3 py-1 text-xs font-medium"
              style={{ borderColor: tagColor, color: tagColor }}
            >
              {tag}
            </span>
          ) : <span />}
          <span
            className={`inline-flex items-center rounded-[6px] px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap ${STATUS_BADGE_CLASS[status] || 'bg-gray-100 text-gray-700'}`}
          >
            {status}
          </span>
        </div>

        <div className="flex-1 px-5 pt-4 pb-5">
          <h3 className="mb-2.5 text-[20px] font-bold leading-snug text-gray-900">
            {title}
          </h3>

          {description && (
            <p className="text-[14px] font-normal leading-relaxed text-gray-400 line-clamp-3">
              {description}
            </p>
          )}
        </div>

        {showProgress && (
          <>
            <div className="px-5 pb-3 flex items-end justify-between">
              <span />
              <div className="text-right">
                <span className="text-base font-bold text-gray-900">{progress}%</span>
                <p className="mt-0.5 text-xs leading-none text-gray-400">{PROGRESS_LABEL[status]}</p>
              </div>
            </div>
            <div className="px-5 pb-5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: statusColor }}
                />
              </div>
            </div>
          </>
        )}

        {!showProgress && showDoneRow && (
          <div className="px-5 pb-5 flex items-end justify-between">
            {newWorkCount > 0 ? (
              <span className="flex items-center gap-1.5 text-[12px] font-normal" style={{ color: '#60B3D7' }}>
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: '#60B3D7' }} />
                {newWorkCount} New Work
              </span>
            ) : <span />}
            {completedAtLabel && (
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#27ae60' }}>
                <Calendar className="h-3.5 w-3.5" />
                {completedAtLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
