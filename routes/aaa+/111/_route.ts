export function GET(_req: Request): Response {
  return new Response(`Hello from '/aaa'`, { status: 200 });
}
