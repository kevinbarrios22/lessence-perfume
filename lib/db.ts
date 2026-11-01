import { Client } from 'pg'
import type { QueryResult, QueryResultRow } from 'pg'
import { env } from 'cloudflare:workers'

export type TransactionClient = {
  query<R extends QueryResultRow = QueryResultRow>(
    queryText: string,
    values?: unknown[],
  ): Promise<QueryResult<R>>
  release(): Promise<void>
}

type Database = {
  query<R extends QueryResultRow = QueryResultRow>(
    queryText: string,
    values?: unknown[],
  ): Promise<QueryResult<R>>
  connect(): Promise<TransactionClient>
}

function crearCliente(connectionString: string): Client {
  return new Client({
    connectionString,
    connectionTimeoutMillis: 5000,
    statement_timeout: 5000,
  })
}

/**
 * Hyperdrive owns the connection pool. Create a fresh pg Client for each
 * operation so no socket or client is reused across Worker requests.
 */
export function getPool(): Database {
  const hyperdrive = (
    env as unknown as {
      HYPERDRIVE?: { connectionString: string }
    }
  ).HYPERDRIVE

  const connectionString = hyperdrive?.connectionString ?? process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('Falta DATABASE_URL en las variables de entorno')
  }

  return {
    async query<R extends QueryResultRow = QueryResultRow>(
      queryText: string,
      values?: unknown[],
    ): Promise<QueryResult<R>> {
      const client = crearCliente(connectionString)
      let connected = false
      try {
        await client.connect()
        connected = true
        return await client.query<R>(queryText, values as never[] | undefined)
      } finally {
        if (connected) await client.end()
      }
    },

    async connect(): Promise<TransactionClient> {
      const client = crearCliente(connectionString)
      await client.connect()
      return {
        query: <R extends QueryResultRow = QueryResultRow>(
          queryText: string,
          values?: unknown[],
        ) => client.query<R>(queryText, values as never[] | undefined),
        release: () => client.end(),
      }
    },
  }
}
