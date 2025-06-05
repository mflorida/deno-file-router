# Deno File Router

## Summary

This is a POC for a routing convention based on a file and directory naming scheme.
The `deno task find-routes` command will crawl the `routes` directory and generate three
files: `.route_data.json`, which contains more details for each valid route,
`.route_file_map.json` which contains an object mapping the file path to the corresponding
url path, and `.route_map.json` which maps the web url path to the corresponding file
on the file system. The `.route_map.json` file can be used as a reference to see the mapping
of urls to the files and is used by the `server-w-routes.ts` script which spins
up a basic web server to serve the corresponding route handlers.

## Naming Conventions

This file-based router uses naming conventions to determine which files will be turned
into routes to be served by the web server. There are some quirks to resolving valid
paths, and could cause conflicts if you mix and match the various patterns. As long
as you standardize on just one convention, mapping the url path to the file should
make sense.

Supported file extensions are `.js`, `.jsx`, `.ts`, and `.tsx`.

The `__root.tsx` file will be used for the site's root url `/`.

### Examples

For example, the following files would all route to the same url path. The various file naming
conventions shown below would all map to the `/path/to/file/` url (relative to the server root).

Route files are stored in the `/routes/` directory and are listed below in the order of precedence
as they would be resolved on a Linux system (the first file found by the route walker 'wins'
and may be different depending on operating system).

| url              | full file path              | folder             | file                    |
|------------------|-----------------------------|--------------------|-------------------------|
| `/path/to/file/` | `/+!path.to.file/_route.ts` | `/+!path.to.file/` | `_route.ts`             |
| `/path/to/file/` | `/+path/to.file/_route.ts`  | `/+path/to.file/`  | `_route.ts`             |
| `/path/to/file/` | `/_path/to.file.route.ts`   | `/_path/`          | `to.file.route.ts`      |
| `/path/to/file/` | `/_path/to.file.route.ts`   | `/_path/`          | `to.file.route.ts`      |
| `/path/to/file/` | `/path/to/file/_route.ts`   | `/path/to/file/`   | `_route.ts`             |
| `/path/to/file/` | `/path/to/file.route.ts`    | `/path/to/`        | `file.route.ts`         |
| `/path/to/file/` | `/path.to.file.route.ts`    | `/`                | `path.to.file.route.ts` |
| `/path/to/file/` | `/path.to.file.rt.ts`       | `/`                | `path.to.file.rt.ts`    |
| `/path/to/file/` | `/path.to.file.rte.ts`      | `/`                | `path.to.file.rte.ts`   |

As you can see, the options are dizzying and could be confusing if mixed and matched. The
`/path/to/file/` url could be resolved to _any_ of these files.

The least confusing and suggested file naming patterns are:

- `/path/to/file/_route.ts` (underscore `_` prefix)
- `/path/to/file/+route.ts` (plus `+` prefix)
- `/path/to/file/route.ts` (no prefix - it will work, but a prefix is recommended)

The folder names match the url path and a file named `_route.ts` (using a prefix of
`_` or `+` is recommended to sort the route file first in the directory listing). The
route file contains the code to be executed for that url. No other files in that folder
would resolve to that specific url route. There can, however, be subroutes using any of
the supported patterns, like:

- `/path/to/file/foo.route.ts` would match the url `/path/to/file/foo/`
- `/path/to/file/foo/_route.ts` also matches and uses the folder name convention

You can also use a Remix v2 naming scheme, with a `.` delimiter and a `.route.ts` suffix:

- `path.to.file.route.ts` - `/path/to/file/`
- `path.to.file.foo.route.ts` - `path/to/file/foo/`

> `*.rte.ts` and `*.rt.ts` suffixes are also supported

The naming conventions can get convoluted, so picking a _single_ pattern to use throughout the _entire_ project is very
important. The rules are listed below.

- A file named `_route.ts` (with or without `_` or `+` prefix) will always resolve to a url matching its _directory_
  path
    - Alternate file names are `_rte.ts` or `_rt.ts` (pick ONE)
- Remix style before the `.route` suffix (dots are converted to a `/` for the url)
    - `path.to.file.route.ts` would match `/path/to/file/` url
- A file with a `.route.ts` suffix will resolve to a url matching the file name and path
    - Valid suffixes are `*.route.ts`, `*.rte.ts`, and `*.rt.ts` (pick ONE)
    - `path.to.file.route.ts` would match `/path/to/file/`
- Folders take precedence over files with the same name (without extension)
- Prefixes and suffixes of `_` or `+` will be ignored when determining url mapping. The following would all
  map to the url `/path/to/file/`
    - `/_path_/+to+/file/route.ts`
    - `/+++path+++/___to___/__file/_route.ts`
    - `/path+/to+/file+/route.ts`
    - `/_path.to+._file+._route.ts`
- A `!` character may be used to preserve `_` or `+` characters in url sections with leading or trailing `_` or
  `+`. The `!` acts as a 'guard' for these special characters so they can be used in the url. This pattern can be _very_
  confusing and should only be used if a url section _absolutely_ needs to start or end with `_` or `+`. The following
  would all map to the url `/+path/+to+/_file/`
    - `/!+path/!+to+!/+!_file/+route.ts`
    - `/+!+path!+/_!+to_/_!_file/_route.ts`
    - `__!+path!__/__!+to!__/__!_file!__/route.ts`

As you can see from the list above, as well as the examples in the `routes` directory, file and folder naming is fairly
flexible but can be a major foot gun if not handled with care.

To summarize the rules for mapping urls to file names:

- A file named `{_+}?route.{js|jsx|ts|tsx}` will be resolved for a url matching its _directory_ path from `/routes/`
- A file with a `.route` suffix will be resolved for a url matching the name up to (but not including) that suffix.
- Any `_` and `+` characters in each path segment will be stripped when matching the url
- Use `!` as a 'guard' to preserve `_` or `+` characters that need to be at the beginning or end of a _url_ segment.

### TODO:

- Handle parameters that are part of url segments.
- ?