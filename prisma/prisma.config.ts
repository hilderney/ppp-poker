// https://www.prisma.io/docs/orm/reference/prisma-schema-reference#datasource
import { defineConfig } from '@prisma/internals'

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/planning_poker',
    },
  },
})
