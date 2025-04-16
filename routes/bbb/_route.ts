export function GET(_req: Request): Response {
  return new Response(`Hello from '/bbb'`, { status: 200 });
}
