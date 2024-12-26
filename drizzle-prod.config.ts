import type { Config } from 'drizzle-kit'

export default {
  schema: './src/main/database/schema.ts',
  out: './migrations/prod',
  dialect: 'turso',
} satisfies Config
