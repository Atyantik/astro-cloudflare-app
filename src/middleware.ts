import { defineMiddleware } from "astro:middleware";
import { getDBClient } from "./db/client";

export const onRequest = defineMiddleware(
  async (context, next) => {
    // intercept data from a request
    // optionally, modify the properties in `locals`
    context.locals.dbClient = await getDBClient(context);
    
    // return a Response or the result of calling `next()`
    return next();
  },
);