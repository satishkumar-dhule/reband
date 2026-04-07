import { onRequest as __api___all___ts_onRequest } from "/home/runner/workspace/functions/api/[[all]].ts"
import { onRequest as __go_api___all___ts_onRequest } from "/home/runner/workspace/functions/go-api/[[all]].ts"

export const routes = [
    {
      routePath: "/api/:all*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___all___ts_onRequest],
    },
  {
      routePath: "/go-api/:all*",
      mountPath: "/go-api",
      method: "",
      middlewares: [],
      modules: [__go_api___all___ts_onRequest],
    },
  ]