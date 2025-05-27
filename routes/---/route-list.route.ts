import { htmlDocument } from '../../layouts/_main.ts';
import route_map from '../../.route_map.json' with { type: 'json' };

const css = `
<style>
:root {
  font-family: "Helvetica Neue", Helvetica, Arial, "DejaVu Sans", sans-serif; 
}
body { margin: 0; padding: 0; }
main { width: fit-content; min-width: 400px; margin: 0 auto; padding: 0 2rem 2rem; }
table { border-collapse: collapse; border-spacing: 0; font-family: "DejaVu Sans Mono", monospace; }
tr:hover { background-color: #6495ED33; }
td { padding: 0.25rem 2rem; }
th { padding: 0 0 1rem; text-align: left; }
th b { display: block; padding: 0.5rem 2rem; background-color: midnightblue; color: white; }
h1 { margin-bottom: 0; padding: 1rem; color: cornflowerblue; }
.block { display: block; }
</style>
`;

const htmlBody = `
<main>
<h1>The Routes</h1>
<table>
<thead>
<tr>
<th><b>Route</b></th>
<th><b>File</b></th>
</tr>
</thead>
<tbody>
<tr>${Object.entries(route_map).map(([key, value]) => `
<td><a href="${key}" target="_blank" class="block">${key}</a></td>
<td>${value}</td>`).join('\n</tr>\n<tr>')}
</tr>
</tbody>
</table>
</main>
`;

export function GET(_req: Request): Response {
  const HTML = htmlDocument({
    TITLE: 'All The Routes',
    HEAD: css,
    BODY: htmlBody
  });

  return new Response(HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    }
  });
}
