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

    const ___route = /^(.*\.)?___\.[tj]sx?$/i;
    const validRoute = /^(.*\.)?([_+]*|\.?)?r(ou)?te?\.[tj]sx?$/i;

    // only process '___.{ts|tsx|js|jsx}' or '*{.|_}route.{ts|tsx|js|jsx}' files
    if (!___route.test(entry.name) && !validRoute.test(entry.name)) {
      return out;
    }

    let route: string;
    let routeFile: string;
    let routeDir: string;

    routeFile = entry.path.split('routes/')[1] || '';

    routeDir = (
      ___route.test(entry.name)
        ? routeFile.split(/[/.]___\.[tj]sx?/i)[0]
        : routeFile.split(/[/.][_+]*r(ou)?te?/i)[0]
    );

    // should match URL.pathname
    route = `/${routeDir.replace(/^[_+]+|[_+]+$/g, '')}`.replace(/[/_+]*[/.][/_+]*/g, '/').replace(/!+/g, '');

    // remove trailing slash
    route = route.replace(/\/+$/, '');

    out[route] = {
      route: route + '/',
      routeDir: routeFile.split(entry.name)[0].replace(/\/+$/, ''),
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

// create an object that maps the
export function createFileMap(dir: string) {
  const routes = createRouteMap(dir);
  // switch key/value
  const fileMap = Object.entries(routes).reduce((files, [key, value]) => {
    files[value] = key;
    return files;
  }, {} as { [key: string]: string });
  // sort by new key (file path)
  return Object.keys(fileMap).sort().reduce((files, file) => {
    files[file] = fileMap[file];
    return files;
  }, {} as { [key: string]: string });
}

const routeData = walkRoutes(routesDir);
Deno.writeTextFileSync('.route_data.json', JSON.stringify(routeData, null, 2));

const routeMap = createRouteMap(routesDir);
Deno.writeTextFileSync('.route_map.json', JSON.stringify(routeMap, null, 2));

const routeFileMap = createFileMap(routesDir);
Deno.writeTextFileSync('.route_file_map.json', JSON.stringify(routeFileMap, null, 2));
