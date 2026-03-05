import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const { transcript, asset_name } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: `You are a maintenance work order parser. Extract structured data from a technician's voice note about completed maintenance work. Return ONLY valid JSON with no extra text.

The JSON should have these fields (all optional — only include fields mentioned):
- action_taken: string — what was done
- root_cause: string — why it failed (if mentioned)
- time_logged_minutes: number — time spent in minutes
- parts_used: array of { name: string, quantity: number } — parts consumed

Example input: "Replaced the drive belt on Rover 3, took about 45 minutes, used one Gates belt from the parts room"
Example output: {"action_taken":"Replaced drive belt","root_cause":"Belt wear","time_logged_minutes":45,"parts_used":[{"name":"Gates belt","quantity":1}]}`,
      messages: [
        {
          role: 'user',
          content: `Parse this technician's completion note${asset_name ? ` (for asset: ${asset_name})` : ''}:\n\n"${transcript}"`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse response' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
