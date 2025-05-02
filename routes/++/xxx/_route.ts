export function GET(_req: Request): Response {
  return new Response(`Hello from '/xxx'`, { status: 200 });
}
