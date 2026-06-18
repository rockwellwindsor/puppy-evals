import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

type Db = ReturnType<typeof drizzle<typeof schema>>

let _instance: Db | undefined

// Lazy initialization so DATABASE_URL is read at first query, not at import time.
// This is required for tests, where env vars are injected after module imports resolve.
export const db = new Proxy({} as Db, {
  get(_, key, receiver) {
    if (!_instance) {
      if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')
      _instance = drizzle(postgres(process.env.DATABASE_URL), { schema })
    }
    return Reflect.get(_instance, key, receiver)
  },
})
