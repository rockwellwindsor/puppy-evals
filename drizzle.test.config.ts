import { config } from 'dotenv'
config({ path: '.env.local', override: true })

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.TEST_DATABASE_URL!,
  },
})
