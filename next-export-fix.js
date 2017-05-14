#!/usr/bin/env node

var fs = require('fs')

const FILE = './node_modules/next/dist/lib/page-loader.js'
const SEARCH1 = `
      route = route.replace(/index$/, '');

      if (route === '/') return route;`
const REPLACE1 = `
      // Remove assetPrefix from route.
      route = route.split(this.assetPrefix).join('')
      if (!route) { route = '/' }
      if (route[route.length - 1] === '/') return route + 'index';`

const SEARCH2 = '_this3.registerEvents.emit(route, { error: error, page: page });\n'
 + '      };'
const REPLACE2 = `_this3.registerEvents.emit(route, { error: error, page: page });
        if (route[route.length - 1] === '/') {
          _this3.pageCache[route + 'index'] = { error: error, page: page };
          _this3.registerEvents.emit(route + 'index', { error: error, page: page });
        }
      };`

fs.readFile(FILE, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  let newData = data
  newData = newData.replace(SEARCH1, REPLACE1);
  newData = newData.replace(SEARCH2, REPLACE2);

  fs.writeFile(FILE, newData, 'utf8', function (err) {
     if (err) return console.log(err);
  });
});
