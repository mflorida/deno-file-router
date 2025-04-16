export function GET(_req: Request): Response {
  return new Response(`Hello from '/api/foo'`, { status: 200 });
}
