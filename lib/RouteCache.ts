/**
 * Cache 'found' routes as they are requested
 */

const routes_kv = await Deno.openKv(':memory:');

const entries = routes_kv.list({ prefix: ['routes'] });
for await (const entry of entries) {
  console.log(entry.key); // ["preferences", "ada"]
  console.log(entry.value); // { ... }
  console.log(entry.versionstamp); // "00000000000000010000"
}

// init route cache on startup (when this file loads)
// (not necessary because Deno KV stores data by the *full* key)
// await routes_kv.set(['routes'], {});

export class RouteCache {
  cachedRoutes = new Map();

  constructor() {}

  async getCachedRoutes() {
    if (this.cachedRoutes.size > 0) {
      // return the things
    }
    const routeKvList = routes_kv.list({
      prefix: ['routes']
    });

    const routeMap = new Map();

    for await (let routeListEntry of routeKvList) {
      routeMap.set(routeListEntry.key[1], routeListEntry.value);
    }

    return Object.fromEntries(routeMap);
  }

  // get file path for specified url pathname
  async routeFilePath(route: string) {
    return (
      // this.cachedRoutes.get(route) ||
      (await routes_kv.get(['routes', route])).value
    );
  }

  async addRoute(route: string, filePath: string) {
    if (!(await this.routeFilePath(route))) {
      // this.cachedRoutes.set(route, filePath);
      await routes_kv.set(['routes', route], filePath);
      // routes_kv.close();
    }
    // get the cached file route from the 'local' cache Map
    // return this.cachedRoutes.get(route);
    await this.showRoutes();
    return await this.routeFilePath(route);
  }

  async showRoutes() {
    const entries = routes_kv.list({ prefix: ['routes'] });
    for await (const entry of entries) {
      console.log(entry.key); // ["preferences", "ada"]
      console.log(entry.value); // { ... }
      console.log(entry.versionstamp); // "00000000000000010000"
    }
  }

}
