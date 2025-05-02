export function GET(_req) {
  return new Response(`Hello from '/api/-/bogus'`, { status: 200 });
}
