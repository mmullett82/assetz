import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://assetz:assetz_dev@localhost:5432/assetz?schema=public'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createClient() {
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
