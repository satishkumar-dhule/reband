import { GraphQLClient } from "graphql-request";

const GRAPHQL_ENDPOINT = "/graphql";

export const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    "Content-Type": "application/json",
  },
});

export async function gql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  return gqlClient.request<T>(query, variables);
}

export default gqlClient;
