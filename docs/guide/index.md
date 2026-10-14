# Getting started

You wrote an Echo library. Now somebody has to understand it.

ecodoc gives you a docs site for that: Markdown pages you write by hand, plus an API reference read out of the library itself. I didn't want a second parser that would disagree with the compiler in six months. The reference comes from `echoc`, which already knows every declaration, every docblock, and every attribute.

## Install it

Every release carries a binary for macOS arm64, Linux x86_64 and Linux arm64. Pick yours and put it on your `PATH`:

```bash
curl -fsSL https://github.com/echolang/ecodoc/releases/latest/download/ecodoc-macos-arm64.tar.gz | tar -xz
sudo mv ecodoc /usr/local/bin/
```

Swap in `ecodoc-linux-x86_64` or `ecodoc-linux-arm64` on Linux. Anything else builds from source: clone the repo, `epm install`, `echoc build`, and the binary is `ecobuild/ecodoc`.

## Create a docs folder

Run `init` in the library's root, next to `module.eco`:

```bash
ecodoc init
```

That writes four files and overwrites none:

```txt
docs/
  docs.eco        the manifest: title, nav, sidebar, API
  index.md        the landing page
  guide/index.md  a first guide page
  .gitignore      dist/ is build output
```

## Preview it

`dev` builds the site, serves it, and rebuilds when you save a page, the manifest, or a source file of the library:

```bash
ecodoc dev
```

Open <http://localhost:3246/>. A failed build keeps the last good site in the browser and prints what went wrong in the terminal. A typo in a page does not take the preview down.

## Build it

```bash
ecodoc build
```

The site lands in `docs/dist/`. Every page is a directory with an `index.html`, so `/guide/intro/` works on any static host without a rewrite rule.

> [!TIP]
> ecodoc calls `echoc` for the manifest and the API reference. It uses `$ECHOC` when that is set, or `--echoc <path>`, and `echoc` on your `PATH` otherwise. The reference needs a compiler with `-p decls`.

Next: [the manifest](./manifest.md), which is where the site is configured.
