import type { APIContext, AstroGlobal } from "astro";
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';

const Client: {
  current: DrizzleD1Database | null
} = {
  current: null
}

export const getDBClient = async (
  astro: AstroGlobal | APIContext,
): Promise<DrizzleD1Database> => {
  if (Client.current) {
    return Client.current;
  }
  const db = drizzle(astro.locals.runtime.env.DB);
  Client.current = db;
  return Client.current;
};