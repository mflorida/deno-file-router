import { htmlDocument } from '../layouts/_main.ts';

const css = `
<style>
body { margin: 0; padding: 0; }
h1 { font-family: sans-serif; color: cornflowerblue; }
</style>
`;

export function GET(_req: Request): Response {
  const HTML = htmlDocument({
    TITLE: 'Cool site, bro!',
    HEAD: css,
    BODY: `<h1>WHAT'S UP???</h1>`
  });

  return new Response(HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    }
  });
}
