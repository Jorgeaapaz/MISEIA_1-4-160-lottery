import { ObjectId } from 'mongodb'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { Lottery, Ticket } from '@/lib/types'
import LotteryDetail from './LotteryDetail'

export const dynamic = 'force-dynamic'

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function LotteryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!ObjectId.isValid(id)) notFound()

  const db = await getDb()
  const lottery = await db
    .collection<Lottery>('lotteries')
    .findOne({ _id: new ObjectId(id) })

  if (!lottery) notFound()

  const soldTickets = await db
    .collection<Ticket>('tickets')
    .find({ lotteryId: new ObjectId(id) })
    .project<{ numbers: number[] }>({ numbers: 1 })
    .toArray()

  const soldNumbers = [...new Set(soldTickets.flatMap((t) => t.numbers))]

  const lotteryData = {
    id: lottery._id!.toString(),
    name: lottery.name,
    endDate: lottery.endDate.toISOString(),
    prizeAmount: lottery.prizeAmount,
    prizeFormatted: fmtCents(lottery.prizeAmount),
    ticketPrice: lottery.ticketPrice,
    ticketPriceFormatted: fmtCents(lottery.ticketPrice),
    numberOfNumbers: lottery.numberOfNumbers,
    status: lottery.status,
    totalTicketsSold: soldTickets.length,
    winningNumber: lottery.winningNumber,
    endDateFormatted: fmtDate(lottery.endDate),
    soldNumbers,
  }

  return <LotteryDetail lottery={lotteryData} />
}
