import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import type { Express } from "express";

export function registerGraphQL(app: Express) {
  const schema = makeExecutableSchema({ typeDefs, resolvers: resolvers as any });

  const yoga = createYoga({
    schema,
    graphqlEndpoint: "/graphql",
    landingPage: process.env.NODE_ENV !== "production",
    logging: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
    },
  });

  app.use("/graphql", yoga as any);

  console.log("✅ GraphQL endpoint registered at /graphql");
}
