---
description: Markdown pages, frontmatter, containers, alerts, and Echo code with its output.
---

# Pages

Every `.md` file under `docs/` is a page. Its URL is its path: `guide/install.md` is `/guide/install/`, and an `index.md` is the URL of its directory.

Folders starting with `.` or `_`, plus `dist/` and `public/`, are skipped. Files in `public/` are copied to the site root as they are, which is where a favicon or a `robots.txt` goes.

The Markdown is CommonMark plus what docs lean on: frontmatter, tables, containers, alerts, and heading ids. Each is below.

## Frontmatter

A page may open with a block of YAML. ecodoc reads the common subset: scalars, lists, and nested maps.

```txt
---
title: Install
description: Getting the library into a project.
outline: false
prev: false
---
```

| Key | Meaning |
|:--|:--|
| `title` | The page title; defaults to the first `#` heading |
| `description` | The meta description and the search summary; defaults to the first paragraph |
| `layout` | `doc` (the default), `home`, or `page` for full width without sidebar |
| `outline` | `false` hides the "On this page" column |
| `sidebar` | `false` hides the sidebar |
| `prev` / `next` | `false`, a title, or `{ text, link }` |
| `editLink` | `false` hides "Edit this page" |

## Links

Link to pages by their file, relative or from the docs root. ecodoc rewrites the link to the page's URL and warns about a file that does not exist:

```txt
[the manifest](./manifest.md)
[install](/guide/install.md#from-git)
```

Link into the API reference with `api:` and a symbol name. With the brackets left empty, the link shows the symbol's own name:

```txt
See [](api:ecodoc::Builder) and [its build method](api:ecodoc::Builder::build).
```

See [](api:ecodoc::Builder) and [its build method](api:ecodoc::Builder::build).

With `autolink` on, inline code that spells a qualified symbol exactly becomes a link too: `ecodoc::site::Links` here is one.

Here is the catch: `ecodoc build --strict` turns a dead link or an unresolved symbol into a failed build instead of a warning. That is the setting for CI.

## Code

A fence with a language gets highlighting. Echo, shell, and JSON are highlighted; everything else is escaped and shown as is. A `title` gives the block a file name, `{1,3-5}` marks lines, and `:line-numbers` numbers them.

````txt
```echo title="hello.eco" {2}
```
````

Here is the part that matters for Echo docs. An `echo` line that ends in a comment is read as "this is what it prints", the convention the Echo docs use, and the block gets an output column:

```echo title="double.eco"
function double(int32 $n) : int32
{
    return $n * 2;
}

echo double(21);  // 42
echo double(-1);  // -2
```

Add `plain` to the fence to keep the comments as comments.

## Containers

`:::` opens a container and `:::` closes it. `tip`, `info`, `warning`, `danger`, and `details` are styled; anything after the kind is the title.

::: tip Heads up
This is a tip with its own title.
:::

::: details Click to open
Hidden until the reader asks for it.
:::

Alerts work too: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION`, plus `COMPILE` for errors the compiler catches:

> [!COMPILE]
> Borrowing from a temporary has no storage to point into. Bind the result to a variable first.

```txt
> [!WARNING]
> Careful.
```

## Home pages

`layout: home` draws a hero and feature cards from the frontmatter, then whatever Markdown follows. This site's landing page is one:

```txt
---
layout: home
hero:
  name: libjson
  text: JSON for Echo
  tagline: Parse, poke, dump.
  actions:
    - theme: brand
      text: Get started
      link: /guide/
features:
  - title: No C
    details: Pure Echo, nothing to link.
---
```

## Search

Every page and every heading, and with a reference every type and member, goes into `search-index.json`. Press `⌘K`, `Ctrl K`, or `/` on any page. The index is fetched the first time the dialog opens, so pages that nobody searches from never pay for it.
