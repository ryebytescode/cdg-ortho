import crypto from 'node:crypto'
import { init as createCuid2 } from '@paralleldrive/cuid2'
import { relations, sql } from 'drizzle-orm'
import { blob, int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

function createId() {
  return createCuid2({
    length: 32,
    fingerprint: crypto.randomUUID(),
  })()
}

const hasId = {
  id: text()
    .$defaultFn(() => createId())
    .primaryKey()
    .notNull(),
}

const defaultTimestamp = sql`(datetime('now','localtime'))`

const timeStamps = {
  createdAt: text().default(defaultTimestamp).notNull(),
  updatedAt: text().$onUpdateFn(() => defaultTimestamp),
}

export const patients = sqliteTable('patients', {
  ...hasId,
  ...timeStamps,
  patientType: text().notNull(),
  entryDateIfOld: int({ mode: 'timestamp' }),
  firstName: text().notNull(),
  lastName: text().notNull(),
  middleName: text(),
  suffix: text(),
  birthdate: int({ mode: 'timestamp' }).notNull(),
  gender: text().notNull(),
  phone: text().notNull(),
  address: text().notNull(),
})

export const bills = sqliteTable('bills', {
  ...hasId,
  createdAt: timeStamps.createdAt,
  lastPaymentDate: text().$onUpdateFn(() => defaultTimestamp),
  patientId: text()
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  procedure: text().notNull(),
  description: text().notNull(),
  serviceAmount: real().notNull(),
  items: text({ mode: 'json' }),
  totalDue: real().notNull(),
  totalPaid: real().default(0),
})

export const payments = sqliteTable('payments', {
  ...hasId,
  createdAt: timeStamps.createdAt,
  billId: text()
    .notNull()
    .references(() => bills.id, { onDelete: 'cascade' }),
  amount: real().notNull(),
  balance: real(),
  paymentMode: text().notNull(),
})

export const files = sqliteTable('files', {
  ...hasId,
  patientId: text()
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  category: text().notNull(),
  name: text().notNull(),
  size: real().notNull(),
  createdAt: timeStamps.createdAt,
  thumbnail: blob(),
})

// Relations
export const patientRelations = relations(patients, ({ many }) => ({
  bills: many(bills),
  files: many(files),
}))

export const billRelations = relations(bills, ({ one, many }) => ({
  patient: one(patients, {
    fields: [bills.patientId],
    references: [patients.id],
  }),
  payments: many(payments),
}))

export const paymentRelations = relations(payments, ({ one }) => ({
  bill: one(bills, {
    fields: [payments.billId],
    references: [bills.id],
  }),
}))

export const fileRelations = relations(files, ({ one }) => ({
  patient: one(patients, {
    fields: [files.patientId],
    references: [patients.id],
  }),
}))
