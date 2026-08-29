import React from 'react'

export function StatsSummary({ stats }) {
  return (
    <section className="px-6 py-10" style={{ background: 'linear-gradient(135deg, #219653 0%, #6FCF97 100%)' }}>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="mb-1 text-5xl font-bold text-white">{stat.count}</div>
            <div className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
