---
description: How the API reference is read, and the attributes that shape it.
---

# API reference

A reference generator usually ships its own parser for the language it documents, and sooner or later that parser disagrees with the compiler.

ecodoc does not parse Echo. It runs your library through `echoc -p decls`, which prints every resolved declaration as JSON: names, types, docblocks, and attributes, exactly as the compiler understood them.

So the reference is never wrong about a signature. If it compiles, it is documented the way it compiles.

## What gets documented

Every `public` declaration of the library, with `internal` added when the manifest asks for it:

- types (structs, classes, enums, interfaces) get a page each, at `/api/<namespace>/<Type>/`
- namespaces get a page, at `/api/<namespace>/`, listing the namespaces below them, their types, and their free functions and constants. The one exception is a top-level namespace holding a single type and nothing else. The type's page covers it.
- members are anchors on their type's page: `/api/json/Value/#get`

The sidebar is the namespace tree: each namespace lists its types, then the namespaces below it, folded until you open one or land on a page inside it. `/api/` has one section per namespace, in the same order.

Overloads share one entry and show one signature each. A free function whose first parameter is one of your types, like a `str::from` hook, shows up on that type's page under "Extensions" as well as in its own namespace.

## Docblocks

A docblock is Markdown. The first paragraph is the summary: it is the lede on a type page, the text on a card, and what search shows. Everything after it is rendered below the signature.

```echo
/**
 * Halve a number, or fail when it is odd.
 *
 * Odd numbers have no integer half, so this does not round:
 *
 * ```echo
 * echo halve(10)->or(-1);  // 5
 * echo halve(7)->or(-1);   // -1
 * ```
 */
public function halve(int32 $n) : result<int32, string>
```

The first ```` ```echo ```` fence in a type's docblock becomes the "At a glance" block at the top of its page, output column included.

I kept `@param` and `@return` as the only tags, and even those are optional. The signature already has the types. A tag only says what the type can't.

## Sections

Members are grouped into numbered sections. Without any attribute the groups follow from what the member is:

| Section | Holds |
|:--|:--|
| Cases | enum cases without a payload |
| Constructors | constructors, enum cases with a payload, statics that return the type |
| Queries | `const` methods |
| Methods | the other methods |
| Static functions | the other statics |
| Operators | operators, including free ones over the type |
| Properties / Constants | the rest |

A section whose members are all one-liners is drawn as a list of compact rows instead of full entries.

## Attributes

Everything else is an attribute in the `docs` namespace, on the declaration itself. echoc carries tool attributes without reading them, so they cost nothing at compile time.

```echo
#[docs::group: "Access"]
#[docs::valid: "has_value()"]
#[docs::outcomes: { ok: "T&, writable through the borrow", fail: "fatal error: unwrap() on a failure" }]
public function unwrap() : T&
```

| Attribute | On | Effect |
|:--|:--|:--|
| `group` | members | The section it is listed under |
| `groups` | types | The section order, as a list |
| `valid` | members | `always`, or the condition it needs: the "Only when ..." pill |
| `outcomes` | members | The two-outcome strip: `{ ok: "...", fail: "..." }` |
| `example` | types, members | A file, relative to the library, shown as the example |
| `see` | types | Related symbols, as strings, next to what the type conforms to |
| `since` / `deprecated` | anything | Badges |
| `compact` | members | Always draw as a card |
| `hidden` | anything | Leave it out of the reference |

> [!NOTE]
> Attribute names and record keys cannot be Echo keywords, and a symbol is written as a string: `#[docs::see: ["status"]]`, not `#[docs::see: [status]]`.

Enum cases and constants take docblocks but no attributes: echoc does not attach attributes to them yet.

## This site's reference

The [API section](/api/) of this site is ecodoc's own source, documented by ecodoc. Start at [](api:ecodoc::Builder): one build of a docs folder, top to bottom.
