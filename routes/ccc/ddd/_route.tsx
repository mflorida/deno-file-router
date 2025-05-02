export function GET(_req: Request): Response {
  return new Response(`Hello from '/ccc'`, { status: 200 });
}
