import prisma from './prisma'

interface CreateNotificationParams {
  organization_id: string
  user_id: string
  title: string
  body: string
  type?: 'alert' | 'info' | 'warning'
  link?: string
}

export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      organization_id: params.organization_id,
      user_id: params.user_id,
      title: params.title,
      body: params.body,
      type: params.type ?? 'info',
      link: params.link,
    },
  })
}

export async function notifyManagers(orgId: string, title: string, body: string, link?: string) {
  const managers = await prisma.user.findMany({
    where: {
      organization_id: orgId,
      role: { in: ['admin', 'manager'] },
      is_active: true,
    },
    select: { id: true },
  })

  await Promise.all(
    managers.map((m) =>
      createNotification({
        organization_id: orgId,
        user_id: m.id,
        title,
        body,
        type: 'alert',
        link,
      })
    )
  )
}
