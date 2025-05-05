export function GET(req) {
  const routeFile = import.meta.url.split('deno-file-router/')[1];
  const url = new URL(req.url);

  const HTML = (`
    <html lang="en">
    <body>
    <p>Hello from route:
      <pre>${url.pathname}</pre>
    </p> 
    <br>
    <p>Handled by file:
      <pre>${routeFile}</pre>
    </p>
    </body>
    </html>
  `);

  return new Response(
    HTML,
    {
      headers: {
        'content-type': 'text/html'
      }
    }
  );
}
