import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are the AI assistant for assetZ, a Computerized Maintenance Management System (CMMS) built for manufacturing environments.

You help maintenance managers, technicians, and requesters with:
- Understanding work orders, PM schedules, assets, and parts
- Troubleshooting equipment issues
- Suggesting maintenance procedures
- Answering questions about maintenance best practices
- Helping interpret asset status and KPI data
- Guiding users through the assetZ interface

Context about the facility:
- SOLLiD Cabinetry — a ~690' × 330' cabinet manufacturing facility
- Equipment includes Biesse CNC machines, HOMAG boring centers, Cefla finishing lines, edge banders, panel saws
- Departments: Mill, Kitting, Assembly, Finishing, White Wood, Maintenance, and more

Keep responses concise and actionable. Use manufacturing terminology when appropriate. If you're unsure about something specific to their facility data, say so rather than guessing.

When the user provides page context, use it to give more relevant answers.`

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { messages, context } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build context string from page context
    let contextStr = ''
    if (context) {
      contextStr = '\n\nCurrent user context:'
      if (context.page) contextStr += `\n- Page: ${context.page}`
      if (context.entityType) contextStr += `\n- Viewing: ${context.entityType}`
      if (context.entityData) contextStr += `\n- Data: ${JSON.stringify(context.entityData).slice(0, 1000)}`
      if (context.userRole) contextStr += `\n- User role: ${context.userRole}`
    }

    const client = new Anthropic({ apiKey })

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT + contextStr,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    // Stream response using ReadableStream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : 'Stream error' })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
