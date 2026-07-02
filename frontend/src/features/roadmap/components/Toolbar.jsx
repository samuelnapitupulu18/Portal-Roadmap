import React from 'react'
import { Search, LayoutGrid, Calendar, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Toolbar({
  activeView,
  onViewChange,
  isFilterOpen,
  onFilterToggle,
  searchQuery,
  onSearchChange,
  totalItems,
}) {
  return (
    <div className="px-16 py-8">
      <div className="flex items-center gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 w-full bg-white border-gray-200"
          />
        </div>

        {/* View Toggle & Filter */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onViewChange('cards')}
            className={
              activeView === 'cards'
                ? 'bg-[#41aa72] hover:bg-[#389463] text-white h-10 px-4'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 h-10 px-4'
            }
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Cards
          </Button>

          <Button
            onClick={() => onViewChange('timeline')}
            className={
              activeView === 'timeline'
                ? 'bg-[#41aa72] hover:bg-[#389463] text-white h-10 px-4'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 h-10 px-4'
            }
          >
            <Calendar className="mr-2 h-4 w-4" />
            Timeline
          </Button>

          <Button
            onClick={onFilterToggle}
            className={
              isFilterOpen
                ? 'bg-[#41aa72] hover:bg-[#389463] text-white h-10 px-4'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 h-10 px-4'
            }
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        {totalItems} work items
      </div>
    </div>
  )
}
