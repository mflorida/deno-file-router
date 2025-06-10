import * as fs from '@std/fs';

type FileRoute = {
  [k: string]: any;
}

const [routesDir = '../routes'] = Deno.args;

export function walkRoutes(dir: string) {
  const routes = fs.walkSync(dir);

  const fileRoutes = Array.from(routes).reduce((out, entry) => {
    // only process files
    if (!entry.isFile) {
      return out;
    }

    // handle __root.* in the routes root
    const rootPath = /\/(_{2}|\+{2})root\.[tj]sx?$/i.test(entry.path);
    const ___ = /^(.*\.)?(_{3}|\+{3})\.[tj]sx?$/i;
    const validRoute = /^(.*\.)?([_+]*|\.?)?r(ou)?te?\.[tj]sx?$/i;

    let isRoot = false;

    if (rootPath) {
      // this is here for debugging purposes
      isRoot = true;
    }

    // only process '___.{ts|tsx|js|jsx}' or '*{.|_}route.{ts|tsx|js|jsx}' files
    if (!isRoot && !___.test(entry.name) && !validRoute.test(entry.name)) {
      return out;
    }

    let route: string;
    let routeFile: string;
    let routeBase: string;
    let routeDir: string;

    routeFile = (entry.path.split(dir)[1] || '').replace(/^\/+/, '/') || '';

    routeDir = entry.path.split(entry.name)[0];

    routeBase = isRoot ? routeFile.split('.')[0] : (
      ___.test(entry.name)
        ? routeFile.split(/[/.]___\.[tj]sx?/i)[0]
        : routeFile.split(/(([/.][_+]+|\.)(rte?|route)\.[tj]sx?)$/i)[0]
    );

    // remove trailing slash?
    route = `/${routeBase.replace(/^[_+]+|[_+]+$/g, '')}`.replace(/\/+$/, '');

    // should match URL.pathname
    route = isRoot ? '/' : route.replace(/[/_+]*[/.][/_+]*/g, '/').replace(/!+/g, '');

    out[route] = out[route] || {
      route: isRoot ? route : route + '/',
      routeBase,
      routeDir,
      routeFile,
      name: entry.name,
      path: entry.path,
    };

    return out;
  }, {} as FileRoute);

  return Object.keys(fileRoutes).sort().reduce((routeData, key) => {
    routeData[key] = fileRoutes[key];
    return routeData;
  }, {} as FileRoute);
}

export function createRouteMap(dir: string) {
  const routeData = walkRoutes(dir);
  return Object.keys(routeData).reduce((routes, key) => {
    routes[routeData[key].route] = routeData[key].routeFile;
    return routes;
  }, {} as { [key: string]: string });
}

// create an object that maps the file path to the server route
export function createFileMap(dir: string) {
  const routes = createRouteMap(dir);
  // switch key/value
  const fileMap = Object.fromEntries(
    Object.entries(routes).map(([key, value]) => [value, key])
  );
  // sort by new key (file path)
  return Object.keys(fileMap).sort().reduce((files, file) => {
    files[file] = fileMap[file];
    return files;
  }, {} as { [key: string]: string });
}

export function writeRouteData(dir: string) {
  const routeData = walkRoutes(dir);
  Deno.writeTextFileSync('.route_data.json', JSON.stringify(routeData, null, 2));
}

export function writeRouteMap(dir: string, fileName = '.route_map.json') {
  const routeMap = createRouteMap(dir);
  Deno.writeTextFileSync(fileName, JSON.stringify(routeMap, null, 2));
}

export function writeFileMap(dir: string) {
  const routeFileMap = createFileMap(dir);
  Deno.writeTextFileSync('.route_file_map.json', JSON.stringify(routeFileMap, null, 2));
}

// if there are args, this file has been run from
// the command-line, so write the JSON files
if (Deno.args.length) {
  writeRouteData(routesDir);
  writeRouteMap(routesDir);
  writeFileMap(routesDir);
  // write the raw output from the fs.walkSync(dir) function.
  Deno.writeTextFileSync('.routes.json', JSON.stringify(Array.from(fs.walkSync(routesDir)), null, 2));
}
