# Getting started

Welcome. This page is the start of the [Markdown](./markdown.md) tour, and the
[code page](code.md#highlighting) shows Echo with its output.

## Install

```bash
epm add echolang/libjson --git https://github.com/echolang/libjson --range ^0.1
echoc build
```

## First program

```echo title="hello.eco"
function double(int32 $n) : result<int32, string>
{
    if ($n < 0) {
        return .error('negative');
    }
    return .ok($n * 2);
}

int32 $n = guard double(21) else {
    die('nope');
}

echo $n;  // 42
```

::: tip
Leave the output as a trailing comment and ecodoc shows it in a column of its own.
:::
