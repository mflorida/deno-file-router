/**
 * Given a route matching `/params/$n1/$n2/sum/`...
 * create a Map object matching the parameter name with the value in the url
 * @param {string} url - actual url from the server
 * @param {string} matchPath - url path with parameters
 */
export function parseParams(url: string, matchPath: string) {
  // 1. split `matchPath` on '/'
  // 2. iterate through `matchPath` to get locations of parameters and add to params object

  const urlSegments = url.split('/');
  const matchSegments = matchPath.split('/');


}

const ROUTE = 'route';

const matcher = {
  math: {
    $$n: {
      sum: ROUTE,
      product: ROUTE,
      average: ROUTE,
      mean: ROUTE,
      max: ROUTE,
      min: ROUTE,
    },
    sum: {
      $$nn: ROUTE,
    }
  }
}

// url: /math/11/22/33/sum
// file: /math/$$n/sum.route.tsx
const alt = {
  parts: ['math'],
  next: {
    parts: ['$$n'],  // possible matches for this segment
    values: ['11', '22', '33'], // corresponding values by index
    next: {
      parts: ['sum', 'product', 'average', 'mean', 'median', 'max', 'min'],
      next: null
    }
  }
}
