[ქართულად](README-KA.md)

# Better LMS

Upgrades the schedule table on LMS to a non-shit one.

![schedule](screenshots/schedule.png)

# Building

requirements: [pnpm](https://pnpm.io/), [web-ext](https://github.com/mozilla/web-ext)

To create the extension zip for both chrome and firefox, run:

```
pnpm package
```

If the only thing you want is a build, run:

```
pnpm build
```

Take a look at [package.json](package.json) for more scripts