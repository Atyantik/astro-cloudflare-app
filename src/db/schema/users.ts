import { int, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable(
  "users",
  {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    age: int().notNull(),
    email: text().notNull().unique(),
  },
  (t) => [
    index("email_idx").on(t.email), // Define indexes using the new array-based API
  ]
);