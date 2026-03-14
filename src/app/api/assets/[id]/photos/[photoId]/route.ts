import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string; photoId: string }> }

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id, photoId } = await context.params

    const asset = await prisma.asset.findFirst({
      where: { id, organization_id: user.organization_id },
      select: { id: true },
    })
    if (!asset) return errorResponse('Asset not found', 404)

    const photo = await prisma.assetPhoto.findFirst({
      where: { id: photoId, asset_id: id },
    })
    if (!photo) return errorResponse('Photo not found', 404)

    // Remove file from disk
    try {
      const filePath = path.join(process.cwd(), 'public', photo.url)
      await unlink(filePath)
    } catch {
      // File may already be missing — continue with DB cleanup
    }

    await prisma.assetPhoto.delete({ where: { id: photoId } })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
