// https://www.prisma.io/docs/orm/reference/prisma-schema-reference#datasource
import { defineConfig } from '@prisma/internals'

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    },
  },
})
