import { existsSync } from 'jsr:@std/fs';
import { RouteCache } from './lib/RouteCache.ts';

/**
 * Doing an http server this way would be better
 * for API routes rather than page routes
 */

// TODO: use Deno.kv when the server starts
//  to store resolved file routes

const cachedRoutes = new RouteCache();

async function resolveRouteFile(routePath: string, filePath: string) {
  let _filePath;

  const routeExists = (
    !!(_filePath = await cachedRoutes.routeFilePath(routePath) as string)
    || existsSync((_filePath = `./routes/${filePath}.tsx`))
    || existsSync((_filePath = `./routes/${filePath}.ts`))
    || existsSync((_filePath = `./routes/${filePath}.jsx`))
    || existsSync((_filePath = `./routes/${filePath}.js`))

    || false
  );

  if (routeExists) {
    await cachedRoutes.addRoute(routePath, _filePath);
    return _filePath;
  }

  return null;
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method;
  let pathname = url.pathname;

  // special things that only run from the same origin
  // poor man's CORS for same-origin
  if (url.origin.includes(url.host)) {
    // special url pathname to list all cached routes
    // http://hostname:3000/--/route-cache/
    if (/GET/i.test(req.method) && /^\/--\/route-cache/.test(pathname)) {
      return new Response(
        JSON.stringify(await cachedRoutes.getCachedRoutes(), null, 2),
        { status: 200, statusText: 'OK' },
      );
    }
  }

  // 1. check the filesystem for a file at the exact path
  // 2. check for a file prefixed with '_' (underscores)
  // 3. check for a file named '_route.*' in a directory that matches the pathname

  // check for files/folders with '_' prefixes

  // only slashes??? it's the ROOT!
  const rootPath = /^\/+$/.test(pathname) ? '__root' : '';

  // strip leading and trailing slashes '/foo/' -> 'foo'
  // pathname = pathname.replace(/^\/+|\/+$/g, '');

  let pathParts = [], lastPart = '', basePath = '', routePath = '';

  if (!rootPath) {
    pathParts = pathname.split('/').filter(Boolean);
    lastPart = pathParts.pop() || '';
    basePath = pathParts.join('/');
    routePath = basePath ? (basePath + '/' + lastPart) : lastPart;
  }

  // TODO: crawl 'routes' directory to find valid routes

  // direct check
  const fileRoute = (
    (rootPath ? (await resolveRouteFile('/', '__root')) : '')

    || await cachedRoutes.routeFilePath(`/${routePath}`)
    || await cachedRoutes.routeFilePath(routePath)

    || await resolveRouteFile(`/${routePath}`, `${routePath}/_route`)
    || await resolveRouteFile(`/${routePath}`, `${routePath}/_${lastPart}`)
    || await resolveRouteFile(`/${routePath}`, `${routePath}`)

    // plused routes
    || await resolveRouteFile(`/${routePath}`, `+${routePath}/_route`)
    || await resolveRouteFile(`/${routePath}`, `+${routePath}/_${lastPart}`)
    || await resolveRouteFile(`/${routePath}`, `+${routePath}`)

    || ''
  );

  if (!fileRoute) {
    await cachedRoutes.showRoutes();
    return new Response('Not found', { status: 404 });
  }

  let module;

  try {
    module = await import(fileRoute as string);
  } catch (_error) {
    return new Response('Not found', { status: 404 });
  }

  if (module[method]) {
    return module[method](req);
  }

  return new Response('Method not implemented', { status: 501 });
}

Deno.serve(handler);
