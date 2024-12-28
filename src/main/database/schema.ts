import { init as createCuid2 } from '@paralleldrive/cuid2'
import { relations, sql } from 'drizzle-orm'
import { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

function createId() {
  return createCuid2({
    length: 32,
    fingerprint: process.env.MAIN_VITE_CUID2_FINGERPRINT,
  })()
}

const hasId = {
  id: text()
    .$defaultFn(() => createId())
    .primaryKey()
    .notNull(),
}

const timeStamps = {
  createdAt: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text().$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
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
  patientId: text()
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  lastPaymentDate: text(),
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
  paymentMode: text().notNull(),
})

// Relations
export const patientRelations = relations(patients, ({ many }) => ({
  bills: many(bills),
}))

export const billRelations = relations(bills, ({ one, many }) => ({
  patient: one(patients, {
    fields: [bills.patientId],
    references: [patients.id],
  }),
  payments: many(payments),
}))
