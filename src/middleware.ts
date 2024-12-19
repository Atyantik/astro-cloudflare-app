import { defineMiddleware } from "astro:middleware";
import { getDBClient } from "./db/client";
import { usersTable } from "./db/schema/users";

export const onRequest = defineMiddleware(
  async (context, next) => {
    // intercept data from a request
    // optionally, modify the properties in `locals`
    
    // return a Response or the result of calling `next()`
    return next();
  },
);