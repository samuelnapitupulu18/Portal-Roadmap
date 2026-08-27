import React from 'react'

export function HeroSection() {
  return (
    <section
      className="px-6 py-16 text-center text-white"
      style={{ background: 'linear-gradient(135deg, #27ae60 0%, #6FCF97 50%, #a8e6c1 100%)' }}
    >
      <div className="mx-auto max-w-4xl">
        <span
          className="mb-4 inline-block rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.4)' }}
        >
          NUSA ROADMAP
        </span>
        <h1 className="mb-4 text-5xl font-bold">Every Issue Has a Progress Story</h1>
        <p className="text-xl" style={{ color: 'rgba(255,255,255,0.9)' }}>
          We share the latest status of every reported issue so you always know
          <br />
          where it stands and what's happening next.
        </p>
      </div>
    </section>
  )
}
