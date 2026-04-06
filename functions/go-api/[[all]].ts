export const onRequest = async (context: any) => {
  const goApiUrl = context.env.GO_API_URL || "https://devprep-go-api.workers.dev";
  const path = context.request.url.replace(/.*\/go-api/, "");
  const url = `${goApiUrl}${path}`;

  return fetch(url, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.method !== "GET" ? await context.request.clone().arrayBuffer() : undefined,
  });
};
