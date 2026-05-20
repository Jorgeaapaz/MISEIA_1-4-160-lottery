import { ObjectId } from 'mongodb'

export type LotteryStatus = 'pending' | 'active' | 'drawing' | 'completed' | 'cancelled'
export type TicketStatus = 'purchased' | 'won' | 'lost'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type TransferStatus = 'pending' | 'completed' | 'failed'
export type UserRole = 'user' | 'admin'

export interface BankAccount {
  accountHolder: string
  accountNumber: string
  bankCode: string
  iban: string
}

export interface User {
  _id?: ObjectId
  email: string
  name: string
  role: UserRole
  bankAccount: BankAccount | null
  isAuthenticated: boolean
  lastLogin: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Lottery {
  _id?: ObjectId
  name: string
  endDate: Date
  prizeAmount: number
  ticketPrice: number
  numberOfNumbers: number
  winningNumber: number | null
  status: LotteryStatus
  totalTicketsSold: number
  createdAt: Date
  updatedAt: Date
  createdBy: ObjectId
}

export interface Ticket {
  _id?: ObjectId
  lotteryId: ObjectId
  userId: ObjectId
  numbers: number[]
  purchaseDate: Date
  transactionId: string
  status: TicketStatus
  createdAt: Date
}

export interface MagicLink {
  _id?: ObjectId
  email: string
  token: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

export interface Payment {
  _id?: ObjectId
  userId: ObjectId
  lotteryId: ObjectId
  ticketId: ObjectId
  stripePaymentIntentId: string
  amount: number
  status: PaymentStatus
  paymentMethod: string
  createdAt: Date
  updatedAt: Date
}

export interface Transfer {
  _id?: ObjectId
  userId: ObjectId
  lotteryId: ObjectId
  amount: number
  status: TransferStatus
  bankTransferId: string
  transactionDate: Date | null
  createdAt: Date
  updatedAt: Date
}

// API response types
export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  bankAccount: BankAccount | null
}

export interface LotteryPublic {
  id: string
  name: string
  endDate: Date
  prizeAmount: number
  ticketPrice: number
  numberOfNumbers: number
  status: LotteryStatus
  totalTicketsSold: number
  winningNumber: number | null
}

export interface TicketPublic {
  id: string
  lotteryId: string
  lotteryName: string
  numbers: number[]
  purchaseDate: Date
  status: TicketStatus
}
