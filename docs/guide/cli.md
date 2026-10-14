# Command line

ecodoc is one binary with four commands. Each reads `./docs` unless you point it somewhere else.

```bash
ecodoc init                # create docs/ with a manifest and two pages
ecodoc dev                 # serve on :3246, rebuild on save
ecodoc build               # write docs/dist
ecodoc serve               # build, then serve docs/dist as deployed on :6423
```

| Option | Commands | Meaning |
|:--|:--|:--|
| `--docs`, `-d <dir>` | all | The docs folder |
| `--out`, `-o <dir>` | build, dev, serve | Where the site is written, `<docs>/dist` by default |
| `--echoc <path>` | all | The compiler; `$ECHOC` or `echoc` on `PATH` otherwise |
| `--base <path>` | build, serve | Serve under this path, overriding `#[docs::base:]` |
| `--port`, `-p <n>` | dev, serve | The port, `3246` for dev and `6423` for serve by default |
| `--strict` | build, serve | Fail on a dead link or an unresolved symbol |

Why those two ports? Type ECHO on a phone keypad and you get 3246. `serve` is the echo coming back, so it gets the same digits reversed: 6423.

## The output directory

`build` empties its output directory before writing, so a page you delete does not linger in the site. Emptying a directory is not something to do by accident, so ecodoc only does it to a directory it created: it leaves a `.ecodoc` file in every output and refuses to clear a non-empty directory without one.

## The cache

Reading the reference means compiling the library, which is the slow part of a build. ecodoc keeps the decls JSON in `docs/.ecodoc/` with a fingerprint of the library's sources, and reuses it until a `.eco` file changes. A docs-only edit rebuilds in milliseconds. Add `.ecodoc/` to your `.gitignore`.

## Previewing the deploy

`dev` is for writing: it serves from `/` whatever the manifest says, and slips a reload script into every page.

`serve` shows you the site a deploy would get instead. It builds the way `build` does, then serves the output untouched under the real base path. A site with `#[docs::base: "/your-lib/"]` answers at `http://localhost:6423/your-lib/`, and `/` sends you there. Nothing is watched, so run it again after a change. It only listens on `127.0.0.1`.

## Deploying

The output is static files. Copy `docs/dist` anywhere that serves files. With [harbor](https://github.com/echolang/harbor):

```bash
harbor push docs/dist docs.example.com --delete
```

When the site lives below the domain root, set `#[docs::base: "/your-lib/"]` so every link carries that path.

## Theme development

The theme (one CSS file and a few ES modules) is compiled into the binary from `theme/`. While working on it, point ecodoc at the directory and skip the rebuild:

```bash
ECODOC_THEME=theme ecodoc dev
./tools/embed-theme.sh       # when it is done, embed it again
```
