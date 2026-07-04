import React from 'react'

export function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-[#6edc9e] to-[#71d9a0] py-16 px-6 text-center text-white">
      <div className="inline-block px-4 py-1 rounded-full border border-white/50 text-white text-xs font-semibold tracking-wider mb-6 uppercase">
        NUSA ROADMAP
      </div>
      <h2 className="text-5xl font-bold mb-4">See What's Being Built</h2>
      <p className="text-lg max-w-2xl mx-auto opacity-90">
        Explore planned stories, track their progress, and stay informed as work moves toward completion.
      </p>
    </section>
  )
}
