import React from 'react'

export function HeroSection({ onNavigate }) {
  return (
    <section className="bg-gradient-to-r from-[#6edc9e] to-[#71d9a0] text-white">
      {/* Top Nav placeholder if needed */}
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-2 flex justify-between items-center">
      </div>

      {/* Hero Content */}
      <div className="py-12 px-6 text-center">
        <div className="inline-block px-4 py-1 rounded-full border border-white/50 text-white text-xs font-semibold tracking-wider mb-6 uppercase">
          NUSA ROADMAP
        </div>
        <h2 className="text-5xl font-bold mb-4">See What's Being Built</h2>
        <p className="text-lg max-w-2xl mx-auto opacity-90">
          Explore planned stories, track their progress, and stay informed as work moves toward completion.
        </p>
      </div>
    </section>
  )
}
