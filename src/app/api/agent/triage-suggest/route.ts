import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const { title, description, location, assets } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey })

    const assetList = assets
      ? `\nKnown assets: ${JSON.stringify(assets.slice(0, 20).map((a: { name: string; facility_asset_id: string; id: string }) => ({ name: a.name, id: a.id, fid: a.facility_asset_id })))}`
      : ''

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      system: `You are a maintenance request triage assistant. Based on the request details, suggest triage parameters. Return ONLY valid JSON with no extra text.

The JSON should have:
- priority: "critical" | "high" | "medium" | "low" — suggested priority
- priority_reason: string — brief reason for priority level
- asset_id: string | null — matched asset ID from the known assets list (null if no match)
- asset_match_reason: string — why this asset was matched (or "No clear asset match")
- urgency_assessment: string — one sentence assessing urgency${assetList}`,
      messages: [
        {
          role: 'user',
          content: `Triage this maintenance request:\nTitle: ${title}\nDescription: ${description || 'None provided'}\nLocation: ${location || 'Not specified'}`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
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
