import { GraphQLClient } from "graphql-request";

function getGraphQLEndpoint(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/graphql`;
  }
  return "/graphql";
}

export const gqlClient = new GraphQLClient(getGraphQLEndpoint(), {
  headers: {
    "Content-Type": "application/json",
  },
});

export async function gql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  return gqlClient.request<T>(query, variables);
}

export default gqlClient;
