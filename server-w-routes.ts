import { createRouteMap } from './lib/walkRoutes.ts';

const routeMap = createRouteMap('routes');

console.log(routeMap);

/**
 * Doing an http server this way would be better
 * for API routes rather than page routes
 */

// TODO: use Deno.kv when the server starts
//  to store resolved file routes

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method;
  let pathname = url.pathname.replace(/\/*$/, '/');

  // special things that only run from the same origin
  // poor man's CORS for same-origin
  if (url.origin.includes(url.host)) {
    // special url pathname to list all cached routes
    // http://hostname:3000/--/route-cache/
    if (/GET/i.test(req.method) && /^\/--\/route-cache/.test(pathname)) {
      return new Response(
        JSON.stringify(routeMap, null, 2),
        { status: 200, statusText: 'OK' },
      );
    }
  }

  // only slashes??? it's the ROOT!
  // const rootPath = /^\/+$/.test(pathname) ? '__root' : '';

  // direct check
  let fileRoute = (
    // (rootPath ? 'routes/__root' : '') ||
    routeMap[pathname] ||
    ''
  );

  fileRoute = './routes' + fileRoute;

  if (!fileRoute) {
    return new Response(`Not found: ${pathname}`, { status: 404 });
  }

  let module;

  try {
    module = await import(fileRoute as string);
  } catch (_error) {
    return new Response(String(_error), { status: 500 });
  }

  if (module[method]) {
    return module[method](req);
  }

  return new Response('Method not implemented', { status: 501 });
}

Deno.serve(handler);
