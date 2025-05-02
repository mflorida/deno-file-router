export function GET(_req: Request): Response {
  return new Response(`Hello from '/api/bar'`, { status: 200 });
}
