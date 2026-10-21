import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('pg')

function cargarEnv(ruta = '.env.local') {
    try {
        for (const linea of readFileSync(ruta, 'utf8').split(/\r?\n/)) {
            const m = linea.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
            if (!m) continue
            const valor = m[2].replace(/^["']|["']$/g, '')
            if (process.env[m[1]] === undefined) process.env[m[1]] = valor
        }
    } catch {
        // Sin .env.local: se usan las variables del entorno.
    }
}

cargarEnv()

const url = process.env.DATABASE_URL
if (!url) {
    console.error('Falta DATABASE_URL (definila en .env.local o en el entorno).')
    process.exit(1)
}

const DIR = join(process.cwd(), 'postgres', 'migrations')
const LOCK = 'perfumes-migraciones'

const client = new Client({ connectionString: url })

async function main() {
    await client.connect()
    await client.query(`
    create table if not exists public.schema_migraciones (
      nombre text primary key,
      aplicada_en timestamptz not null default now()
    )
  `)

    await client.query('select pg_advisory_lock(hashtext($1))', [LOCK])

    try {
        const archivos = readdirSync(DIR)
            .filter((archivo) => archivo.endsWith('.sql'))
            .sort()

        const { rows } = await client.query('select nombre from public.schema_migraciones')
        const aplicadas = new Set(rows.map((fila) => fila.nombre))

        let pendientes = 0
        for (const archivo of archivos) {
            if (aplicadas.has(archivo)) {
                console.log(`= ${archivo} (ya aplicada)`)
                continue
            }

            const sql = readFileSync(join(DIR, archivo), 'utf8')
            await client.query('begin')
            try {
                await client.query(sql)
                await client.query(
                    'insert into public.schema_migraciones (nombre) values ($1)',
                    [archivo]
                )
                await client.query('commit')
                pendientes++
                console.log(`+ ${archivo}`)
            } catch (error) {
                await client.query('rollback')
                throw new Error(`Falló ${archivo}: ${error.message}`)
            }
        }

        console.log(
            pendientes === 0
                ? 'Base de datos al día.'
                : `${pendientes} migración(es) aplicada(s).`
        )
    } finally {
        await client.query('select pg_advisory_unlock(hashtext($1))', [LOCK])
        await client.end()
    }
}

main().catch((error) => {
    console.error(error.message)
    process.exit(1)
})
