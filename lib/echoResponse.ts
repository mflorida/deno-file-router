export function echoResponse(req: { url: string }, filePath: string) {
  const routeFile = filePath.split('deno-file-router/')[1];
  const url = new URL(req.url);

  return new Response(
    `Hello from '${url.pathname}' route, handled by file '${routeFile}'`,
    { status: 200 }
  );
}
