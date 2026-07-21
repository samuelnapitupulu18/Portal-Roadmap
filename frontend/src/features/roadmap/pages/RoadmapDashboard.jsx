import React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRoadmapData } from '@/features/roadmap/api/useRoadmapData'
import { HeroSection } from '@/features/roadmap/components/HeroSection'
import { StatsSummary } from '@/features/roadmap/components/StatsSummary'
import { EpicCard } from '@/features/roadmap/components/EpicCard'
import { FilterSidebar } from '@/features/roadmap/components/FilterSidebar'
import { DetailPanel } from '@/features/roadmap/components/DetailPanel'

export function RoadmapDashboard() {
  const {
    tasks,
    stats,
    filterOptions,
    isLoading,
    error,
    selectedStatuses,
    selectedCategories,
    selectedReleaseDate,
    toggleStatus,
    toggleCategory,
    selectReleaseDate,
    clearAllFilters,
    searchQuery,
    setSearchQuery,
    selectedTask,
    isDetailOpen,
    handleTaskClick,
    handleChildClick,
    handleBack,
    canGoBack,
    handleDetailClose,
  } = useRoadmapData()

  const releaseDateLabel = filterOptions.releaseDates.find((r) => r.value === selectedReleaseDate)?.label
    || selectedReleaseDate

  const chips = [
    ...selectedStatuses.map((v) => ({ key: `status-${v}`, label: `Status: ${v}`, onRemove: () => toggleStatus(v) })),
    ...selectedCategories.map((v) => ({ key: `category-${v}`, label: `Category: ${v}`, onRemove: () => toggleCategory(v) })),
    ...(selectedReleaseDate
      ? [{ key: 'date', label: `Date: ${releaseDateLabel}`, onRemove: () => selectReleaseDate(selectedReleaseDate) }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-[#f2fcf5] font-sans">
      <main>
        <HeroSection />
        <StatsSummary stats={stats} />
        <div className="max-w-7xl mx-auto pb-16 px-16">
          <div className="pt-8 pb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-white border-gray-200"
              />
            </div>
          </div>

          <div className="text-sm font-medium text-gray-400 mb-2">
            {tasks.length} features
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {chips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full pl-3 pr-2 py-1 text-xs text-gray-700"
                >
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-[#41aa72] hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading && (
                <div className="col-span-full py-16 text-center text-gray-400">
                  <p className="text-lg font-medium">Loading stories...</p>
                </div>
              )}
              {error && !isLoading && (
                <div className="col-span-full py-16 text-center text-red-500">
                  <p className="text-lg font-medium">Error loading data</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}
              {!isLoading && !error && tasks.map((task) => (
                <EpicCard
                  key={task.id}
                  {...task}
                  onClick={() => handleTaskClick(task)}
                />
              ))}
              {!isLoading && !error && tasks.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400">
                  <p className="text-lg font-medium">No items found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>

            <FilterSidebar
              statusOptions={filterOptions.statuses}
              categoryOptions={filterOptions.categories}
              releaseDateOptions={filterOptions.releaseDates}
              selectedStatuses={selectedStatuses}
              selectedCategories={selectedCategories}
              selectedReleaseDate={selectedReleaseDate}
              onToggleStatus={toggleStatus}
              onToggleCategory={toggleCategory}
              onSelectReleaseDate={selectReleaseDate}
              onResetAll={clearAllFilters}
            />
          </div>
        </div>
      </main>

      <DetailPanel
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        onChildClick={handleChildClick}
        onBack={handleBack}
        canGoBack={canGoBack}
      />
    </div>
  )
}
