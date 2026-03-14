import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.ms-excel',
]

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const asset = await prisma.asset.findFirst({
      where: { id, organization_id: user.organization_id },
      select: { id: true },
    })
    if (!asset) return errorResponse('Asset not found', 404)

    const documents = await prisma.assetDocument.findMany({
      where: { asset_id: id },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(documents)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const asset = await prisma.asset.findFirst({
      where: { id, organization_id: user.organization_id },
      select: { id: true },
    })
    if (!asset) return errorResponse('Asset not found', 404)

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const caption = formData.get('caption') as string | null

    if (!file) return errorResponse('No file provided', 400)
    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse('File must be PDF, DOCX, or XLSX', 400)
    }
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('File exceeds 25MB limit', 400)
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'assets', id, 'documents')
    await mkdir(uploadDir, { recursive: true })

    const ext = file.name.split('.').pop() || 'pdf'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filePath = path.join(uploadDir, uniqueName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const url = `/uploads/assets/${id}/documents/${uniqueName}`

    const document = await prisma.assetDocument.create({
      data: {
        asset_id: id,
        url,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        caption: caption || undefined,
        uploaded_by_id: user.id,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
