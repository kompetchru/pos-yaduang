import prisma from '../lib/prisma'

export async function generateReceiptNo(): Promise<string> {
  const today = new Date()
  const prefix = today.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD

  const lastSale = await prisma.sale.findFirst({
    where: { receiptNo: { startsWith: prefix } },
    orderBy: { receiptNo: 'desc' },
  })

  let seq = 1
  if (lastSale) {
    const lastSeq = parseInt(lastSale.receiptNo.slice(8))
    seq = lastSeq + 1
  }

  return `${prefix}${seq.toString().padStart(4, '0')}`
}
