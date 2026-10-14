# The manifest

The site is configured in `docs/docs.eco`. It is an Echo manifest, the same kind of file as your `module.eco`, written as tool attributes in the `docs` namespace.

ecodoc never parses it itself. It asks `echoc -p manifest` for the values, so the syntax is exactly the compiler's.

```echo
#[module: "docs"]

#[docs::title: "libjson"]
#[docs::description: "JSON for Echo."]
#[docs::nav: [{ text: "Guide", link: "/guide/" }, { text: "API", link: "/api/" }]]
#[docs::api: { manifest: "../module.eco" }]
```

The `#[module: "docs"]` line is required. It is what makes the file a manifest echoc accepts.

Why Echo and not a `config.json`? Because the docs live next to an Echo library, and echoc already parses attributes, records, and lists. A typo in the manifest is a compiler error with a line number. When echoc grows, the manifest grows with it.

## Site

| Attribute | What it sets |
|:--|:--|
| `title` | The name in the header, the footer, and every page title |
| `description` | The landing page tagline and the default meta description |
| `version` | The version chip; defaults to the library's `#[version:]` |
| `logo` | An image for the header instead of the initial tile |
| `base` | The path the site is served under, `/libjson/` when the site lives below the domain root |
| `repo` | The repository link in the header |
| `edit` | The "Edit this page" URL; `{path}` becomes the page's path in `docs/` |
| `source` | Where source files are browsable; members link to `file#L12` below it |
| `theme` | `dark`, `light`, or `auto` (the default, the reader's system setting) |
| `footer` | `"text"` or `{ message: "...", copyright: "..." }` |

## Nav and sidebar

The nav is a list of links in the header. A link marks itself current on every page below its first path segment, so `/guide/` stays highlighted on `/guide/manifest/`.

```echo
#[docs::nav: [{ text: "Guide", link: "/guide/" }, { text: "Echo", link: "https://echoc.dev" }]]
```

A sidebar belongs to a `base`. A page gets the sidebar whose base is the longest prefix of its URL, and the order of the links in it is the order of the previous and next buttons at the bottom of each page.

```echo
#[docs::sidebar: [{ base: "/guide/", items: [
    { text: "Start", items: [
        { text: "Getting started", link: "/guide/" },
        { text: "Install", link: "/guide/install" }
    ] }
] }]]
```

Links are written as URLs: `/guide/install`. File paths like `guide/install.md` also work (ecodoc normalises them), but the URL is what the reader sees.

> [!NOTE]
> Record keys in an attribute value are names, not strings, so a sidebar keyed by path like `{ "/guide/": [...] }` cannot be written. That is why every sidebar carries its `base` instead.

## API

`#[docs::api:]` turns on the reference. Without it the site is pages only.

```echo
#[docs::api: { manifest: "../module.eco", visibility: public, autolink: true }]
```

| Key | Default | Meaning |
|:--|:--|:--|
| `manifest` | `"../module.eco"` | The library, relative to `docs/` |
| `visibility` | `public` | The lowest visibility shown: `public` or `internal` |
| `autolink` | `true` | Inline code that names a symbol becomes a link to it |
| `all` | `false` | Include dependencies and the standard library |
| `modules` | all | Only these modules, when `all` brings in more than you want |
| `base` | `"/api/"` | Where the reference lives |
| `title` | `"API"` | Its title in the sidebar and on its index page |

What the reference shows, and the attributes that shape it, are on [the API page](./api.md).
