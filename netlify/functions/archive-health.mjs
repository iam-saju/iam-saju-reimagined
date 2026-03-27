export default async function handler() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: 'netlify-function',
  });
}

export const config = {
  path: '/api/health',
};

