import { Auth0Provider } from "./auth/Auth0Provider.js";

Auth0Provider.onAuth(async () => {
  resource.defaultHeaders.authorization = Auth0Provider.bearer;
});

// TODO Set your baseURL
// @ts-ignore
export const resource = new LightPath({
  baseURL: "http://localhost:3000",
  timeout: 8000,
  headers: { authorization: "Bearer token" }
});
