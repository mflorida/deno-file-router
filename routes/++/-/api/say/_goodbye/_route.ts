export function GET(_req: Request): Response {
  return new Response(`Goodbye from '/api/greeting/goodbye'`, { status: 200 });
}
