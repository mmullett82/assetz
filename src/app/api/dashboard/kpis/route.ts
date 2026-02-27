import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const orgId = user.organization_id
    const now = new Date()

    // Start of current week (Monday)
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
    weekStart.setHours(0, 0, 0, 0)

    // End of today
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const [
      openWOs,
      overdueWOs,
      dueTodayWOs,
      completedThisWeek,
      assetsDown,
      totalAssets,
      pmTotal,
      pmCompletedOnTime,
      completedWOsWithHours,
      lowStockParts,
      activeTechs,
    ] = await Promise.all([
      // Open work orders (not completed/cancelled)
      prisma.workOrder.count({
        where: { organization_id: orgId, status: { notIn: ['completed', 'cancelled'] } },
      }),
      // Overdue work orders
      prisma.workOrder.count({
        where: { organization_id: orgId, status: { notIn: ['completed', 'cancelled'] }, due_date: { lt: now } },
      }),
      // Due today
      prisma.workOrder.count({
        where: { organization_id: orgId, status: { notIn: ['completed', 'cancelled'] }, due_date: { gte: todayStart, lte: todayEnd } },
      }),
      // Completed this week
      prisma.workOrder.count({
        where: { organization_id: orgId, status: 'completed', completed_at: { gte: weekStart } },
      }),
      // Assets down
      prisma.asset.count({
        where: { organization_id: orgId, status: 'down' },
      }),
      // Total assets (excluding decommissioned)
      prisma.asset.count({
        where: { organization_id: orgId, status: { not: 'decommissioned' } },
      }),
      // Total active PM schedules
      prisma.pMSchedule.count({
        where: { organization_id: orgId, is_active: true },
      }),
      // PM schedules completed on time (last_completed_at exists and next_due_at is in the future)
      prisma.pMSchedule.count({
        where: { organization_id: orgId, is_active: true, next_due_at: { gt: now } },
      }),
      // Completed WOs with actual_hours for MTTR
      prisma.workOrder.findMany({
        where: { organization_id: orgId, status: 'completed', actual_hours: { not: null } },
        select: { actual_hours: true },
      }),
      // Low stock parts
      prisma.part.count({
        where: { organization_id: orgId, status: { in: ['low_stock', 'out_of_stock'] } },
      }),
      // Active technicians with open WOs
      prisma.workOrder.findMany({
        where: { organization_id: orgId, status: { notIn: ['completed', 'cancelled'] }, assigned_to_id: { not: null } },
        select: { assigned_to_id: true },
        distinct: ['assigned_to_id'],
      }),
    ])

    // Calculate MTTR
    let mttr: number | undefined
    if (completedWOsWithHours.length > 0) {
      const totalHours = completedWOsWithHours.reduce((sum, wo) => sum + (wo.actual_hours || 0), 0)
      mttr = Math.round((totalHours / completedWOsWithHours.length) * 100) / 100
    }

    // PM compliance rate
    const pmCompliance = pmTotal > 0 ? Math.round((pmCompletedOnTime / pmTotal) * 100) : 100

    return NextResponse.json({
      open_work_orders: openWOs,
      overdue_work_orders: overdueWOs,
      work_orders_due_today: dueTodayWOs,
      work_orders_completed_this_week: completedThisWeek,
      assets_down: assetsDown,
      total_assets: totalAssets,
      pm_compliance_rate: pmCompliance,
      mean_time_to_repair: mttr,
      parts_low_stock: lowStockParts,
      technicians_active: activeTechs.length,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
