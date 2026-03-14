import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const asset = await prisma.asset.findFirst({
      where: { id, organization_id: user.organization_id },
      select: { id: true },
    })
    if (!asset) return errorResponse('Asset not found', 404)

    const photos = await prisma.assetPhoto.findMany({
      where: { asset_id: id },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(photos)
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
      return errorResponse('File must be JPG, PNG, or WEBP', 400)
    }
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('File exceeds 10MB limit', 400)
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'assets', id, 'photos')
    await mkdir(uploadDir, { recursive: true })

    const ext = file.name.split('.').pop() || 'jpg'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filePath = path.join(uploadDir, uniqueName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const url = `/uploads/assets/${id}/photos/${uniqueName}`

    const photo = await prisma.assetPhoto.create({
      data: {
        asset_id: id,
        url,
        caption: caption || undefined,
        file_name: file.name,
        file_size: file.size,
        uploaded_by_id: user.id,
      },
    })

    return NextResponse.json(photo, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
