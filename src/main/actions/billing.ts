import { eq, sql } from 'drizzle-orm'
import { ipcMain } from 'electron'
import { DB } from '../database/connection'
import { bills, payments } from '../database/schema'

export function registerBillingHandlers() {
  ipcMain.handle('create-bill', async (_, fields: BillFields) => {
    const result = await DB.insert(bills).values({
      ...fields,
      totalDue: fields.totalAmount,
    })

    return result.rowsAffected > 0
  })

  ipcMain.handle('update-bill', async (_, fields: BillFields) => {
    const result = await DB.update(bills)
      .set({
        ...fields,
        totalDue: fields.totalAmount,
      })
      .where(eq(bills.id, fields.id))

    return result.rowsAffected > 0
  })

  ipcMain.handle('get-bills', async (_, id: string) => {
    return await DB.query.bills.findMany({
      where: (bills, { eq }) => eq(bills.patientId, id),
      orderBy: (bills, { desc }) => [
        desc(bills.createdAt),
        desc(bills.lastPaymentDate),
      ],
    })
  })

  ipcMain.handle('get-bill', async (_, id: string) => {
    return await DB.query.bills.findFirst({
      where: (bills, { eq }) => eq(bills.id, id),
      with: {
        patient: true,
        payments: true,
      },
    })
  })

  ipcMain.handle('settle-bill', async (_, fields: SettleFields) => {
    const result = await DB.transaction(async (tx) => {
      let hasError = false
      const insertPaymentResult = await tx.insert(payments).values({
        ...fields,
        paymentMode: fields.paymentMode ?? '',
      })

      if (insertPaymentResult.rowsAffected === 0) hasError = true

      const updateBillResult = await tx
        .update(bills)
        .set({
          totalPaid: sql`${bills.totalPaid} + ${fields.amount}`,
        })
        .where(eq(bills.id, fields.billId))

      if (updateBillResult.rowsAffected === 0) hasError = true

      if (hasError) tx.rollback()

      return hasError
    })

    return !result
  })
}
