# ecodoc

You wrote an [Echo](https://echoc.dev) library. Now somebody has to understand it.

ecodoc is a docs site for that library. You keep a `docs/` folder next to `module.eco`: Markdown you write by hand, and an API reference read out of the library itself. One static site comes out the other side.

## A complete pass

Every release carries a binary for macOS arm64, Linux x86_64 and Linux arm64. ecodoc calls [`echoc`](https://echoc.dev/guide/installation) for the manifest and the reference, so you need that too.

macOS, Apple Silicon:

```bash
curl -fsSL https://github.com/echolang/ecodoc/releases/latest/download/ecodoc-macos-arm64.tar.gz | tar -xz
sudo mv ecodoc /usr/local/bin/
```

Linux, x86_64:

```bash
curl -fsSL https://github.com/echolang/ecodoc/releases/latest/download/ecodoc-linux-x86_64.tar.gz | tar -xz
sudo mv ecodoc /usr/local/bin/
```

On Linux arm64 the archive is `ecodoc-linux-arm64.tar.gz`. Same two commands. Anywhere else, build it. You need `echoc` and `clang`:

```bash
git clone https://github.com/echolang/ecodoc
cd ecodoc
epm install
echoc build
```

That writes `ecobuild/ecodoc`. Put it on your `PATH`, or call it by that path. The examples below say `ecodoc`.

### A docs folder

From the library's root, next to `module.eco`:

```bash
ecodoc init
```

Four files, and it overwrites none of them:

```txt
docs/
  docs.eco        the manifest: title, nav, sidebar, API
  index.md        the landing page
  guide/index.md  a first guide page
  .gitignore      dist/ is build output
```

Run it again and each line says `kept`. A file that is already there stays as it is, so this is safe in a docs folder you have been writing for a month.

When `module.eco` sits one directory up, init writes a manifest in this shape. Nav and sidebar come along too. These are the lines that matter:

```echo
#[module: "docs"]

#[docs::title: "libjson"]
#[docs::description: "JSON for Echo."]
#[docs::api: { manifest: "../module.eco" }]
```

`#[module: "docs"]` is required. It is what makes the file a manifest `echoc` accepts. ecodoc never parses `docs.eco` itself. It asks `echoc -p manifest`, so a typo is a compiler error with a line number.

Drop the `api` line and you get a guide with no reference.

### Preview it

```bash
ecodoc dev
```

Open <http://localhost:3246/>. Save a page, the manifest, or a library source and it rebuilds. A failed build keeps the last good site in the browser and prints what went wrong. A typo in a page does not take the preview down.

### Build it

```bash
ecodoc build
```

The site lands in `docs/dist/`. Every page is a directory with an `index.html`, so `/guide/intro/` works on a static host with no rewrite rule.

`build` empties that directory before writing, so a page you deleted does not linger. It only does this to a directory it created: every output gets a `.ecodoc` file, and a non-empty directory without one is left alone.

## The reference

The reference is the reason to use this instead of a pile of Markdown.

Docblocks are Markdown. The first paragraph is the summary: the lede on the type page, the text on a card, and what search shows. The rest renders under the signature. The first `echo` fence in a type's docblock becomes the "At a glance" block, and a trailing comment is read as what the line prints:

````echo
/**
 * Double a number.
 *
 * ```echo
 * echo double(21);  // 42
 * ```
 */
public function double(int32 $n) : int32
{
    return $n * 2;
}
````

Same trick on an ordinary page. A fence marked `echo` grows an output column from those comments. Add `plain` when the comment is actually a comment.

With `autolink` on (the default), inline code that spells a symbol exactly becomes a link to it. `ecodoc build --strict` turns a dead link, or a symbol that does not resolve, into a failed build. That is the setting for CI. Without `--strict` you get a warning and a site anyway.

The attributes that shape a page (`group`, `valid`, `outcomes`, and the rest) are in [the API guide](docs/guide/api.md).

## Commands

Four commands. Each reads `./docs` unless you point it somewhere else.

```bash
ecodoc init     # create docs/
ecodoc dev      # serve on :3246, rebuild on save
ecodoc build    # write docs/dist
ecodoc serve    # build, then serve the deploy on :6423
```

Why those ports? Type ECHO on a phone keypad and you get 3246. `serve` is the echo coming back, so it gets the same digits reversed.

`dev` is for writing. It serves from `/` no matter what `#[docs::base:]` says, and it injects a reload script. `serve` is the site a deploy would get: the real base path, nothing watched, bound to `127.0.0.1`. A site with `#[docs::base: "/your-lib/"]` answers at `http://localhost:6423/your-lib/`.

| Option | Commands | Meaning |
|:--|:--|:--|
| `--docs`, `-d <dir>` | all | the docs folder, `./docs` by default |
| `--out`, `-o <dir>` | build, dev, serve | where the site is written |
| `--echoc <path>` | all | the compiler. `$ECHOC`, or `echoc` on `PATH` |
| `--base <path>` | build, serve | serve under this path, overriding the manifest |
| `--port`, `-p <n>` | dev, serve | the listen port |
| `--strict` | build, serve | fail on a dead link or an unresolved symbol |

Reading the reference means compiling the library, which is the slow part. ecodoc keeps the decls JSON in `docs/.ecodoc/` and reuses it until a `.eco` file changes. A docs-only edit rebuilds in milliseconds. Add `.ecodoc/` to `.gitignore`. `init` only ignores `dist/`.

## GitHub Pages

ecodoc is also a GitHub Action. In a library's workflow:

```yaml
- uses: actions/checkout@v5
- uses: echolang/ecodoc@v0
  with:
    base: /${{ github.event.repository.name }}/
    strict: true
```

It installs Echo and ecodoc, runs `epm install` when there is a lock file, builds the site, and uploads it as the Pages artifact. A second job with `actions/deploy-pages` publishes it. The complete workflow and every input are in [the command line guide](docs/guide/cli.md#github-pages).

Deploying, the base path, and the harbor one-liner are in [the command line guide](docs/guide/cli.md). The rest of the writing lives next to it:

- [Getting started](docs/guide/index.md)
- [The manifest](docs/guide/manifest.md)
- [Pages](docs/guide/pages.md)
- [API reference](docs/guide/api.md)

## Working on ecodoc

```bash
epm install
echoc build    # ecobuild/ecodoc
echoc test
```

The theme is one CSS file and a few scripts under `theme/`. `tools/embed-theme.sh` turns them into `c/theme.c`, and the build links that in. While you are editing the theme, read the files from disk and skip the rebuild:

```bash
ECODOC_THEME=theme ecodoc dev
./tools/embed-theme.sh
```

The second command writes `c/theme.c` again. Skip it and the next `echoc build` still ships the old CSS.

The guide above is this repo's `docs/` folder. From here, `ecodoc dev` serves it as a site.
