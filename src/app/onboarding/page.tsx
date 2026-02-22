import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Onboarding' }

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome to assetZ</h1>
          <p className="mt-2 text-slate-400">
            Let&apos;s set up your facility. This should take about 10 minutes.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
          <p className="text-slate-400 text-sm text-center">
            AI-guided onboarding wizard — coming soon
          </p>
        </div>
      </div>
    </div>
  )
}
