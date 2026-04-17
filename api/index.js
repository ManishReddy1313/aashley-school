import serverData from "../dist/index.cjs";

export default async function handler(req, res) {
  const app = await serverData.initPromise;
  
  // Hand the request to Express
  return app(req, res);
}
