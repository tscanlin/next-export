# next-export

Export next.js sites to be served statically. By default this outputs to a `sites` directory in the root of your project. Huge thank you to @matthewmueller for getting the initial PR going for this functionality!


## Getting Started

Install it

```bash
npm i -D next-export
```

Then add the scripts to your package.json

```json
"scripts": {
  "fix-next-for-export": "fix-next-for-export",
  "next-export": "next-export"
}
```

And run it

```bash
npm run fix-next-for-export && npm run next-export
```


## What does 'fix-next-for-export' do?

It modifies some bits of `next/dist/lib/page-loader.js`

Specifically it changes the functions `normalizeRoute` and `registerPage`. These changes are necessary to make index / root paths work.

Normally when next.js is used server side it serves js back from paths ending in `/`. This isn't possible with static sites so we do some mapping to keep the same `/` path but actually fetch and `index` file instead.

### `normalizeRoute`

before:
```js
normalizeRoute (route) {
  if (route[0] !== '/') {
    throw new Error('Route name should start with a "/"')
  }
  route = route.replace(/index$/, '')

  if (route === '/') return route
  return route.replace(/\/$/, '')
}
```

after:
```js
normalizeRoute (route) {
  if (route[0] !== '/') {
    throw new Error('Route name should start with a "/"')
  }
  // Remove assetPrefix from route.
  route = route.split(this.assetPrefix).join('')
  // Make sure it's at least a slash incase the assetPrefix makes it an empty string (for root url).
  if (!route) { route = '/' }
  // Add index to the end of the route if it ends w/ '/'
  if (route[route.length - 1] === '/') return route + 'index'
  return route.replace(/\/$/, '')
}
```

### `registerPage`

before:
```js
const register = () => {
  const { error, page } = regFn()
  this.pageCache[route] = { error, page }
  this.registerEvents.emit(route, { error, page })
}
```

after:
```js
const register = () => {
  const { error, page } = regFn()
  this.pageCache[route] = { error, page }
  this.registerEvents.emit(route, { error, page })
  // This caches root / index routes under both `/` and `/index` keys.
  if (route[route.length - 1] === '/') {
    this.pageCache[route + 'index'] = { error: error, page: page };
    this.registerEvents.emit(route + 'index', { error: error, page: page });
  }
}
```
