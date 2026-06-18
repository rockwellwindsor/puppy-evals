import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'

const { parsed } = config({ path: '.env.local', override: true })

export default defineConfig({
  test: {
    env: {
      ...parsed,
      DATABASE_URL: parsed?.TEST_DATABASE_URL ?? '',
    },
    testTimeout: 15000,
  },
})
