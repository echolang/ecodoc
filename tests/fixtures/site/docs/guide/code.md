# Code

## Highlighting

```echo {2}
#[group: "math"]
public struct Point
{
    public float64 $x = 0.0;

    public const function len() : float64
    {
        return std::math::sqrt($this->x * $this->x);
    }
}

$p = Point(3.0);
echo "x is {$p->x}";  // x is 3
echo $p->len();       // 3
```

```json
{ "name": "libjson", "version": 1, "ok": true }
```

```txt
plain text stays plain
```

## Links

A [dead link](./missing.md) is a warning.
