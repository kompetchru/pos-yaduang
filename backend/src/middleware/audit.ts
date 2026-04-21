import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import prisma from '../lib/prisma'

export const auditLog = (action: string, entity: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res)
    res.json = (body: any) => {
      if (res.statusCode < 400 && req.user) {
        prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            entity,
            entityId: body?.id || req.params?.id,
            detail: { method: req.method, body: req.body },
          },
        }).catch(console.error)
      }
      return originalJson(body)
    }
    next()
  }
}
