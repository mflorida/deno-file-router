import { existsSync } from 'jsr:@std/fs';

/**
 * Doing an http server this way would be better
 * for API routes rather than page routes
 */

// TODO: use Deno.kv when the server starts
//  to store resolved file routes
function resolveRouteFile(pathname: string) {
  const routePath = ('./routes' + pathname).replace(/\/+/g, '/');
  return existsSync(routePath) ? routePath : '';
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method;
  let pathname = url.pathname;
  let module;

  // 1. check the filesystem for a file at the exact path
  // 2. check for a file prefixed with '_' (underscores)
  // 3. check for a file named '_route.*' in a directory that matches the pathname

  // check for files/folders with '_' prefixes

  // only slashes??? it's the ROOT!
  const rootPath = /^\/+$/.test(pathname) ? (
    resolveRouteFile('/__root.ts') ||
    resolveRouteFile('/__root.tsx') ||
    resolveRouteFile('/__root.js') ||
    resolveRouteFile('/__root.jsx') ||
    ''
  ) : '';

  // strip leading and trailing slashes '/foo/' -> 'foo'
  pathname = pathname.replace(/^\/+|\/+$/g, '');

  let pathParts = pathname.split('/');
  let lastPart = pathParts.pop();
  let basePath = pathParts.join('/');
  let fullPath = basePath + '/' + lastPart;

  // direct check
  const fileRoute = (
    rootPath
    // non-plused routes
    || resolveRouteFile(`/${fullPath}/_route.ts`)
    || resolveRouteFile(`/${fullPath}/_route.tsx`)
    || resolveRouteFile(`/${fullPath}/_route.js`)
    || resolveRouteFile(`/${fullPath}/_route.jsx`)

    || resolveRouteFile(`/${basePath}/_${lastPart}.ts`)
    || resolveRouteFile(`/${basePath}/_${lastPart}.tsx`)
    || resolveRouteFile(`/${basePath}/_${lastPart}.js`)
    || resolveRouteFile(`/${basePath}/_${lastPart}.jsx`)

    || resolveRouteFile(`/${basePath}/${lastPart}/_${lastPart}.ts`)
    || resolveRouteFile(`/${basePath}/${lastPart}/_${lastPart}.tsx`)
    || resolveRouteFile(`/${basePath}/${lastPart}/_${lastPart}.js`)
    || resolveRouteFile(`/${basePath}/${lastPart}/_${lastPart}.jsx`)

    // plused routes
    || resolveRouteFile(`/+${fullPath}/_route.ts`)
    || resolveRouteFile(`/+${fullPath}/_route.tsx`)
    || resolveRouteFile(`/+${fullPath}/_route.js`)
    || resolveRouteFile(`/+${fullPath}/_route.jsx`)

    || resolveRouteFile(`/+${basePath}/${lastPart}/_${lastPart}.ts`)
    || resolveRouteFile(`/+${basePath}/${lastPart}/_${lastPart}.tsx`)
    || resolveRouteFile(`/+${basePath}/${lastPart}/_${lastPart}.js`)
    || resolveRouteFile(`/+${basePath}/${lastPart}/_${lastPart}.jsx`)

    || resolveRouteFile(`/+${basePath}/_${lastPart}.ts`)
    || resolveRouteFile(`/+${basePath}/_${lastPart}.tsx`)
    || resolveRouteFile(`/+${basePath}/_${lastPart}.js`)
    || resolveRouteFile(`/+${basePath}/_${lastPart}.jsx`)

    || resolveRouteFile(`/${fullPath}.ts`)
    || resolveRouteFile(`/${fullPath}.tsx`)
    || resolveRouteFile(`/${fullPath}.js`)
    || resolveRouteFile(`/${fullPath}.jsx`)

    || resolveRouteFile(`/+${fullPath}.ts`)
    || resolveRouteFile(`/+${fullPath}.tsx`)
    || resolveRouteFile(`/+${fullPath}.js`)
    || resolveRouteFile(`/+${fullPath}.jsx`)

    || ''
  );

  if (!fileRoute) {
    return new Response('Not found', { status: 404 });
  }

  try {
    module = await import(fileRoute);
  } catch (_error) {
    return new Response('Not found', { status: 404 });
  }

  if (module[method]) {
    return module[method](req);
  }

  return new Response('Method not implemented', { status: 501 });
}

Deno.serve(handler);
