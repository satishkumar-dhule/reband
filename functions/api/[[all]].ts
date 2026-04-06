import app from "../../worker/index";

export const onRequest = async (context: any) => {
  return app.fetch(context.request, context.env, context);
};
