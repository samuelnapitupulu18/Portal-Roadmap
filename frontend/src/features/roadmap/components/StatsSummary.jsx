import React from 'react'

export function StatsSummary({ stats }) {
  return (
    <section className="bg-[#41aa72] text-white py-8 px-6">
      <div className="max-w-4xl mx-auto flex justify-between text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center">
            <span className="text-4xl font-bold mb-1">{stat.count}</span>
            <span className="text-xs uppercase tracking-wide opacity-90">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
