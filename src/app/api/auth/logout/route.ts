import { NextResponse } from 'next/server'

export async function POST() {
  // JWT is stateless — just return 204
  return new NextResponse(null, { status: 204 })
}
