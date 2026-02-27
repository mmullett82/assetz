'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { USE_MOCK } from '@/lib/config'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800))
      } else {
        await login(email, password)
      }
      router.push('/dashboard')
    } catch {
      setError('Invalid email or password.')
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
        <p className="mt-2 text-sm text-slate-400">Sign in to your organization</p>
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
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-h-[48px]"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
          Register
        </Link>
      </p>
    </div>
  )
}
