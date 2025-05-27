import { writeRouteMap } from './lib/walkRoutes.ts';

const ROUTES_DIR = 'routes';
const ROUTES_FILE = '.route_map.json';

try {
  // walk the 'routes' dir and write valid routes to '.route_map.json'
  writeRouteMap(ROUTES_DIR, ROUTES_FILE);
} catch (err) {
  throw new Error(JSON.stringify(err));
}

let routeMap: { [key: string]: string } = {};

try {
  // *read* the '.route_map.json' file to cache valid routes in memory
  const route_map_json = Deno.readTextFileSync(ROUTES_FILE);
  routeMap = JSON.parse(route_map_json);
} catch (err) {
  throw new Error(JSON.stringify(err));
}


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
  if (/^\/---\//.test(pathname)) {
    // only allow access to /---/* paths from same host
    if (url.origin.includes(url.host)) {
      // special url pathname to list all cached routes
      // http://hostname:3000/---/routes/
      if (/GET/i.test(req.method) && /(\/+---\/+routes(\/+)?)$/.test(pathname)) {
        return new Response(
          JSON.stringify(routeMap, null, 2),
          {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
          },
        );
      }
    } else {
      return new Response(
        'No access.',
        {
          status: 405,
          statusText: 'Not Allowed',
        },
      );
    }
  }

  let fileRoute = '';

  if (routeMap[pathname]) {
    fileRoute = './' + ROUTES_DIR + (routeMap[pathname] || '');
  } else {
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
