import { redirect } from 'next/navigation'

// Root route — redirect to dashboard (middleware will bounce to login if unauthenticated)
export default function RootPage() {
  redirect('/dashboard')
}
