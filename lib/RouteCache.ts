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
await routes_kv.set(['routes'], {});

export class RouteCache {
  // cachedRoutes = new Map();

  constructor() {}

  async getCachedRoute(route: string) {
    return (
      // this.cachedRoutes.get(route) ||
      (await routes_kv.get(['routes', route])).value
    );
  }

  async addRoute(route: string, filePath: string) {
    if (!(await this.getCachedRoute(route))) {
      // this.cachedRoutes.set(route, filePath);
      await routes_kv.set(['routes', route], filePath);
      // routes_kv.close();
    }
    // get the cached file route from the 'local' cache Map
    // return this.cachedRoutes.get(route);
    await this.showRoutes();
    return await this.getCachedRoute(route);
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
