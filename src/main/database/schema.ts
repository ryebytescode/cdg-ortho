import { init as createCuid2 } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

function createId() {
  return createCuid2({
    length: 32,
    fingerprint: process.env.MAIN_VITE_CUID2_FINGERPRINT,
  })()
}

export const patientsTable = sqliteTable('patients', {
  id: text()
    .$defaultFn(() => createId())
    .primaryKey()
    .unique()
    .notNull(),
  createdAt: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text().$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
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
