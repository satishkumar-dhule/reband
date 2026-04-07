function getGraphQLEndpoint(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/graphql`;
  }
  return "/graphql";
}

export async function gql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const response = await fetch(getGraphQLEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e: any) => e.message).join(", "));
  }

  return json.data as T;
}

export const gqlClient = {
  request: gql,
};

export default gqlClient;
