/**
 * This is not a route since the `route` suffix is not prepended with dot `.`
 * (it's `not_a_route` insteade of `not_a.route`). If the file was named
 * `+not_a.route.ts` the url path would be `/not_a/`. The difference is
 * subtle, but significant.
 */
export function GET() {
  return (
    'How did you get here???'
  );
}
