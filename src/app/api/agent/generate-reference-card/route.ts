import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const { model, manufacturer } = await request.json()

    if (!model) {
      return NextResponse.json({ error: 'Model name is required' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are a maintenance reference card generator. Given an equipment model name, generate a structured reference card with common maintenance procedures, safety warnings, failure modes, spare parts, and lubrication schedules.

Return ONLY valid JSON with no extra text. The JSON should have:
{
  "title": "Reference Card — [Model Name]",
  "sections": [
    {
      "section_type": "safety",
      "title": "Safety Warnings",
      "content": { "warnings": [{ "level": "danger|warning|caution", "message": "..." }] }
    },
    {
      "section_type": "procedures",
      "title": "Standard PM Procedures",
      "content": { "steps": ["Step 1...", "Step 2..."] }
    },
    {
      "section_type": "failures",
      "title": "Common Failure Modes",
      "content": { "failures": [{ "symptom": "...", "cause": "...", "fix": "..." }] }
    },
    {
      "section_type": "spare_parts",
      "title": "Recommended Spare Parts",
      "content": { "parts": [{ "part_number": "...", "name": "...", "quantity": 1 }] }
    },
    {
      "section_type": "lubrication",
      "title": "Lubrication Schedule",
      "content": { "points": [{ "point": "...", "lubricant": "...", "frequency": "...", "quantity": "..." }] }
    },
    {
      "section_type": "troubleshooting",
      "title": "Troubleshooting Guide",
      "content": { "tree": [{ "symptom": "...", "check": "...", "action": "..." }] }
    }
  ]
}

Generate realistic, practical content based on typical maintenance requirements for this type of equipment. If you know the specific model, use accurate information. If not, use industry-standard practices for that equipment category.`,
      messages: [
        {
          role: 'user',
          content: `Generate a reference card for: ${model}${manufacturer ? ` (manufactured by ${manufacturer})` : ''}`,
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
