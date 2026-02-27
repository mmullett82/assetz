import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { detail: 'Photo upload not yet implemented' },
    { status: 501 }
  )
}
