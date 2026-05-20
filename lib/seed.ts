import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'lottery_db'

async function seed() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)

  console.log('🌱 Seeding database:', MONGODB_DB)

  // Clear existing data
  await db.collection('users').deleteMany({})
  await db.collection('lotteries').deleteMany({})
  await db.collection('tickets').deleteMany({})
  await db.collection('magicLinks').deleteMany({})
  await db.collection('payments').deleteMany({})
  await db.collection('transfers').deleteMany({})

  const now = new Date()

  // Admin user
  const adminResult = await db.collection('users').insertOne({
    email: 'admin@lottery.local',
    name: 'Administrador',
    role: 'admin',
    bankAccount: null,
    isAuthenticated: true,
    lastLogin: null,
    createdAt: now,
    updatedAt: now,
  })
  console.log('✅ Admin created:', adminResult.insertedId.toString())

  // Regular user with bank account
  const userResult = await db.collection('users').insertOne({
    email: 'user@example.com',
    name: 'Usuario de Prueba',
    role: 'user',
    bankAccount: {
      accountHolder: 'Usuario de Prueba',
      accountNumber: '1234567890',
      bankCode: '0049',
      iban: 'ES9121000418450200051332',
    },
    isAuthenticated: true,
    lastLogin: null,
    createdAt: now,
    updatedAt: now,
  })
  console.log('✅ Test user created:', userResult.insertedId.toString())

  // Lottery 1: active, ends in 7 days
  const lottery1 = await db.collection('lotteries').insertOne({
    name: 'Gran Sorteo de Primavera',
    endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    prizeAmount: 50000000, // 500,000 €
    ticketPrice: 500,      // 5 €
    numberOfNumbers: 50,
    winningNumber: null,
    status: 'active',
    totalTicketsSold: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: adminResult.insertedId,
  })
  console.log('✅ Lottery 1 created:', lottery1.insertedId.toString())

  // Lottery 2: active, ends in 3 days
  const lottery2 = await db.collection('lotteries').insertOne({
    name: 'Sorteo Rápido Semanal',
    endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    prizeAmount: 1000000,  // 10,000 €
    ticketPrice: 100,      // 1 €
    numberOfNumbers: 20,
    winningNumber: null,
    status: 'active',
    totalTicketsSold: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: adminResult.insertedId,
  })
  console.log('✅ Lottery 2 created:', lottery2.insertedId.toString())

  // Lottery 3: completed
  const lottery3 = await db.collection('lotteries').insertOne({
    name: 'Sorteo de Invierno (Finalizado)',
    endDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    prizeAmount: 25000000, // 250,000 €
    ticketPrice: 250,      // 2.50 €
    numberOfNumbers: 30,
    winningNumber: 17,
    status: 'completed',
    totalTicketsSold: 5,
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: now,
    createdBy: adminResult.insertedId,
  })
  console.log('✅ Lottery 3 (completed) created:', lottery3.insertedId.toString())

  console.log('\n📧 To login, request magic links for:')
  console.log('   Admin: admin@lottery.local')
  console.log('   User:  user@example.com')
  console.log('\n✨ Seed complete!')

  await client.close()
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
