import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/pm-schedules/extract
 * 
 * Accepts a document (PDF, image, or text) and uses AI to extract
 * PM intervals and tasks. In mock mode, returns realistic sample data.
 * In production, this would call an LLM with the document content.
 */

export type ExtractedInterval = {
  frequency: string
  title: string
  estimatedHours: string
  tasks: string[]
}

export type ExtractionResult = {
  intervals: ExtractedInterval[]
  assetHint?: string  // If the doc mentions a specific machine
  confidence: number  // 0-1 extraction confidence
  source: string      // filename or 'manual entry'
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const text = formData.get('text') as string | null

    if (!file && !text) {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 })
    }

    const filename = file?.name ?? 'text input'

    // In production, we'd:
    // 1. Extract text from PDF/image (pdf-parse, tesseract, or vision API)
    // 2. Send to LLM with structured extraction prompt
    // 3. Parse the response into ExtractedInterval[]
    //
    // For now, return realistic mock data based on common PM schedules

    // Simulate AI processing time
    await new Promise((r) => setTimeout(r, 1500))

    const result: ExtractionResult = {
      intervals: [
        {
          frequency: 'daily',
          title: 'Daily Inspection',
          estimatedHours: '0.25',
          tasks: [
            'Visual inspection of machine for damage or wear',
            'Check coolant/lubricant levels',
            'Verify emergency stop functions',
            'Clear chips and debris from work area',
            'Check air pressure gauges',
          ],
        },
        {
          frequency: 'weekly',
          title: 'Weekly Maintenance',
          estimatedHours: '0.5',
          tasks: [
            'Clean and inspect way covers',
            'Check spindle belt tension',
            'Inspect hydraulic hoses for leaks',
            'Lubricate all grease points per lube chart',
            'Clean electrical cabinet air filter',
          ],
        },
        {
          frequency: 'monthly',
          title: 'Monthly Service',
          estimatedHours: '2',
          tasks: [
            'Check and adjust spindle bearings',
            'Inspect and clean servo motors',
            'Test axis positioning accuracy',
            'Replace coolant filters',
            'Verify safety interlock operation',
            'Check tool changer alignment',
          ],
        },
        {
          frequency: 'quarterly',
          title: 'Quarterly Overhaul',
          estimatedHours: '4',
          tasks: [
            'Replace hydraulic fluid and filters',
            'Inspect ball screws for wear',
            'Check and calibrate axis backlash',
            'Clean and inspect ATC magazine',
            'Test all alarm functions',
            'Replace air compressor filter element',
            'Inspect electrical connections for tightness',
          ],
        },
        {
          frequency: 'annual',
          title: 'Annual Overhaul',
          estimatedHours: '8',
          tasks: [
            'Full geometric alignment check and correction',
            'Replace spindle bearings if needed',
            'Replace all drive belts',
            'Full electrical inspection and thermography',
            'Rebuild hydraulic power unit',
            'Replace way wipers and seals',
            'Full system backup and software update',
            'Calibrate all measurement probes',
          ],
        },
      ],
      assetHint: undefined,
      confidence: 0.87,
      source: filename,
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 })
  }
}
