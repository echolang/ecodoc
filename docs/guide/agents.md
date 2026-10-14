---
description: Markdown twins of every page, llms.txt, Accept text/markdown, and the docs as an agent skill.
---

# Docs for agents

Most of the reading your docs get won't be done by people. It will be done by an agent halfway through writing code against your library, which fetched a page, got 18 KB of HTML with a theme toggle and a search dialog in it, and now has to dig the signature out.

So every ecodoc site is also written for agents. Nothing to turn on: `ecodoc build` writes it next to the HTML.

```txt
docs/dist/
  llms.txt                 the map: every page, one line each
  guide/cli/index.html     the page, for people
  guide/cli.md             the same page, for agents
  api.md                   the reference index, every signature at the end
  api/json/Value.md        one type, as an interface definition
  skill/libjson/SKILL.md   the docs as an agent skill
  skill/libjson.zip        the same, zipped for claude.ai
```

## Markdown twins

Every page has a twin: the same content as plain Markdown, at the page's URL without the trailing slash and with `.md` added. `/guide/cli/` is `/guide/cli.md`, `/` is `/index.md`. That rule is the one llms.txt suggests, and it means an agent can guess the twin of any page it already knows.

A twin is not the source file. The source says `./manifest.md`, `api:json::Value` and `::: tip`, which mean nothing outside ecodoc. The twin says what the HTML says, in Markdown every reader understands:

| You wrote | The twin has |
|:--|:--|
| `[the manifest](./manifest.md)` | `[the manifest](/guide/manifest.md)`, the other page's twin |
| `[](api:json::Value)` | ``[`Value`](/api/json/Value.md)`` |
| `::: tip Heads up` | `> [!TIP]` with `**Heads up**` |
| `::: details Why` | `**Why**` and the text, nothing hidden |
| a fence opened with `echo [a.eco] {1,3}` | one opened with `echo title="a.eco"` |
| a home page's hero and features | a title, a tagline, links and a feature list |

The `echo $x;  // 42` comments of an Echo example are left alone. To an agent, that comment is exactly what the program prints.

Every HTML page names its twin in the head, so an agent that lands on the HTML can find its way:

```txt
<link rel="alternate" type="text/markdown" href="/guide/cli.md">
```

## The reference as interfaces

An API page is mostly chrome: headings, pills, source links, an outline. Its twin is the type's interface definition instead, one line of Echo per declaration with the docblock as comments above it:

````md
```echo
namespace json;

// A JSON value of any kind.
class Value
{
    // The value under `$key`, or nothing when there is none.
    // @valid only when `isObject()`
    const function get(const string& $key) : Value?;
}
```
````

Type names are qualified where a link would have said where a type lives, and `#[docs::valid:]`, `outcomes`, `since` and `deprecated` become `@valid`, `@outcome`, `@since` and `@deprecated` lines.

`api.md`, the twin of the reference index, ends with `## Signatures`: every declaration of the library with a one-line summary, namespace by namespace. It is usually the only file an agent writing code needs.

## llms.txt

`llms.txt` at the site root is the front door, in the format [llmstxt.org](https://llmstxt.org) proposes: the title, the description, a paragraph on how to read the site, then one list of links per sidebar group, in sidebar order. The reference follows, one line per namespace and type. Pages no sidebar lists go under `## Optional`.

A hand-written `public/llms.txt` replaces the generated one.

## Absolute links

Links in the twins and `llms.txt` are site paths, `/guide/cli.md`. Inside the site that is all they need. Pasted into a chat, they point nowhere. Tell ecodoc where the site is published and they become full URLs:

```echo
#[docs::url: "https://echolang.github.io/ecodoc"]
```

The base is part of the URL. When the manifest sets `url` and no `base`, the path of the URL becomes the base. `--url` and the action's `url` input set it from CI instead. Pages also get a `<link rel="canonical">`. `ecodoc dev` leaves links on your machine.

The skill needs none of this for its own pages: a link from one bundled page to another points at the file next to it, `../api/index.md`, so the skill reads the copy it carries. A link to a page with no twin, one kept from agents, goes to its HTML instead.

## Asking for Markdown

`ecodoc serve` and `ecodoc dev` answer a request for Markdown with the twin, so an agent can ask for a page by its normal URL:

```bash
curl -H 'Accept: text/markdown' http://localhost:6423/guide/cli/
```

A browser's `*/*` still gets the HTML. A static host serves files and nothing else, so on GitHub Pages ask for the `.md` URL instead.

## The skill

An [agent skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) is a folder an agent loads when a task needs it. ecodoc writes your docs as one:

```txt
skill/libjson/
  SKILL.md                              when to use it, the quick start, a map of the files
  references/guide/01-getting-started.md
  references/api/index.md               every namespace and type, then every signature
  references/api/json.md                one namespace, its types as interfaces
```

`SKILL.md` is the part that is always read, so it stays short: the description, the first page of your sidebar as a quick start, and one line per reference file. The rest is read only when the task needs it.

Copy the folder into `.claude/skills/` in a project, or `~/.claude/skills/` for every project. On claude.ai, upload `skill/libjson.zip`. The skill is named after your library's module; `skill: { name: "..." }` picks another.

## Turning it down

`#[docs::llms:]` tunes all of it:

```echo
#[docs::llms: {
    exclude: ["/guide/internal/"],
    intro: "Prefer guard over ?? when a failure needs handling.",
    skill: { name: "libjson", description: "...", zip: false }
}]
```

| Key | Default | Meaning |
|:--|:--|:--|
| `exclude` | none | URL prefixes that get no twin and are left out of `llms.txt` and the skill |
| `intro` | none | A paragraph for agents, in `llms.txt` and `SKILL.md` |
| `skill` | `true` | `false` writes no skill; an object sets `name`, `description` and `zip` |

`llms: false` in a page's frontmatter leaves that page out. `#[docs::llms: false]` turns everything here off, and the site is HTML only again.
