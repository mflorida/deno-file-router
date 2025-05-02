export function GET(_req: Request): Response {
  return new Response(`Hello from '/b/c/d/e'`, { status: 200 });
}
