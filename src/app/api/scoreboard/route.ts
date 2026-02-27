import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const orgId = user.organization_id

    // Get all technicians
    const techs = await prisma.user.findMany({
      where: { organization_id: orgId, role: 'technician', is_active: true },
      select: { id: true, full_name: true, email: true, role: true },
    })

    const now = new Date()

    // Get all WOs for this org
    const allWOs = await prisma.workOrder.findMany({
      where: { organization_id: orgId },
      select: {
        id: true,
        assigned_to_id: true,
        status: true,
        priority: true,
        due_date: true,
        completed_at: true,
        actual_hours: true,
        estimated_hours: true,
      },
    })

    const scoreboard = techs.map((tech) => {
      const myWOs = allWOs.filter((wo) => wo.assigned_to_id === tech.id)
      const completed = myWOs.filter((wo) => wo.status === 'completed')
      const open = myWOs.filter((wo) => !['completed', 'cancelled'].includes(wo.status))
      const overdue = open.filter((wo) => wo.due_date && new Date(wo.due_date) < now)
      const onTime = completed.filter((wo) => {
        if (!wo.due_date || !wo.completed_at) return true
        return new Date(wo.completed_at) <= new Date(wo.due_date)
      })

      const totalHours = completed.reduce((sum, wo) => sum + (wo.actual_hours || 0), 0)
      const avgHours = completed.length > 0 ? totalHours / completed.length : 0
      const completionRate = completed.length > 0
        ? Math.round((onTime.length / completed.length) * 100)
        : 100

      return {
        user_id: tech.id,
        full_name: tech.full_name,
        email: tech.email,
        role: tech.role,
        total_completed: completed.length,
        total_open: open.length,
        total_overdue: overdue.length,
        on_time_rate: completionRate,
        avg_completion_hours: Math.round(avgHours * 100) / 100,
        total_hours: Math.round(totalHours * 100) / 100,
      }
    })

    return NextResponse.json(scoreboard)
  } catch (err) {
    return handleApiError(err)
  }
}
