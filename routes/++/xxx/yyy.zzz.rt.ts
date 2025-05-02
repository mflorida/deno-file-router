export function GET(_req: Request): Response {
  return new Response(`Hello from '/xxx/yyy/zzz'`, { status: 200 });
}
