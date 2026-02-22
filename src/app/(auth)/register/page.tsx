'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Zap } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    organization: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      // TODO: wire to registration API endpoint
      await new Promise((r) => setTimeout(r, 800)) // placeholder
      window.location.href = '/onboarding'
    } catch {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2">
          <Zap className="h-8 w-8 text-blue-400" aria-hidden="true" />
          <span className="text-3xl font-bold tracking-tight text-white">assetZ</span>
        </div>
        <p className="mt-2 text-sm text-slate-400">Create your organization account</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-900/50 border border-red-700 px-3 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-slate-300 mb-1.5">
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              value={form.full_name}
              onChange={handleChange}
              className="block w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-slate-300 mb-1.5">
              Organization name
            </label>
            <input
              id="organization"
              name="organization"
              type="text"
              autoComplete="organization"
              required
              value={form.organization}
              onChange={handleChange}
              className="block w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
              placeholder="Acme Manufacturing"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className="block w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              className="block w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
              placeholder="Min 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-h-[48px]"
          >
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
