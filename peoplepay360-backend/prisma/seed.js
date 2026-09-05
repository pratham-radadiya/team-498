require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@peoplepay360.com' },
    update: {},
    create: {
      email: 'admin@peoplepay360.com',
      passwordHash,
      role: 'ADMIN',
      status: 'Active',
    },
  })

  console.log('Seeded Admin user:', admin.email)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
