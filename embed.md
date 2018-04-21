# Embedding gba.ninja

## Autorun Option

Automatically run ROMs like so:

```
https://gba.ninja/?autorun=https://example.com/exampleRom.gba
```

## Exclusive option

Prevent showing of the UI using the exclusive option. This causes the
user to be unable to use the UI. If a game fails to load, the user is
prompted to reload the page.

Undefined behavior occurs if you load a file that is not a rom using the
autoload and exclusive options.


```
https://gba.ninja/?autorun=https://example.com/exampleRom.gba&exclusive
```

