import { Pool } from 'pg'

const globalForPg = globalThis as unknown as { pgPool: Pool | undefined }

export function getPool(): Pool {
    if (!process.env.DATABASE_URL) {
        throw new Error('Falta DATABASE_URL en las variables de entorno')
    }
    if (!globalForPg.pgPool) {
        globalForPg.pgPool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 10,
        })
    }
    return globalForPg.pgPool
}
