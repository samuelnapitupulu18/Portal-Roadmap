import React from 'react'
import { useRoadmapData } from '@/features/roadmap/api/useRoadmapData'
import { HeroSection } from '@/features/roadmap/components/HeroSection'
import { StatsSummary } from '@/features/roadmap/components/StatsSummary'
import { Toolbar } from '@/features/roadmap/components/Toolbar'
import { TaskCard } from '@/features/roadmap/components/TaskCard'
import { FilterPanel } from '@/features/roadmap/components/FilterPanel'
import { TimelineView } from '@/features/roadmap/components/TimelineView'
import { DetailPanel } from '@/features/roadmap/components/DetailPanel'

export function RoadmapDashboard() {
  const {
    // Data
    tasks,
    stats,

    // View
    activeView,
    setActiveView,

    // Filters
    isFilterOpen,
    toggleFilter,
    selectedStatus,
    setSelectedStatus,
    selectedProject,
    setSelectedProject,
    selectedMonth,
    setSelectedMonth,
    searchQuery,
    setSearchQuery,

    // Detail Panel
    selectedTask,
    isDetailOpen,
    handleTaskClick,
    handleDetailClose,
  } = useRoadmapData()

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans">
      <main>
        <HeroSection />
        <StatsSummary stats={stats} />
        <div className="max-w-7xl mx-auto pb-16">
          <Toolbar
            activeView={activeView}
            onViewChange={setActiveView}
            isFilterOpen={isFilterOpen}
            onFilterToggle={toggleFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalItems={tasks.length}
          />

          <FilterPanel
            isOpen={isFilterOpen}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />

          {activeView === 'cards' && (
            <div className="px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  {...task}
                  onClick={() => handleTaskClick(task)}
                />
              ))}
              {tasks.length === 0 && (
                <div className="col-span-3 py-16 text-center text-gray-400">
                  <p className="text-lg font-medium">No items found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          )}

          {activeView === 'timeline' && (
            <TimelineView tasks={tasks} onTaskClick={handleTaskClick} />
          )}
        </div>
      </main>

      <DetailPanel
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
      />
    </div>
  )
}
