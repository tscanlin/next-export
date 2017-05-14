#!/usr/bin/env node

var fs = require('fs')

const FILE = './node_modules/next/dist/lib/page-loader.js'
const SEARCH1 = `
      route = route.replace(/index$/, '');

      if (route === '/') return route;`
const REPLACE1 = `// Remove assetPrefix from route.
      route = route.split(this.assetPrefix).join('')
      if (!route) { route = '/' }
      if (route[route.length - 1] === '/') return route + 'index';`

const SEARCH2 = '_this3.registerEvents.emit(route, { error: error, page: page });\n'
 + '      };'
const REPLACE2 = `_this3.registerEvents.emit(route, { error: error, page: page });
        if (route === '/') {
          _this3.pageCache['/index'] = { error: error, page: page };
          _this3.registerEvents.emit('/index', { error: error, page: page });
        }
      };`

fs.readFile(FILE, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(SEARCH1, REPLACE1);
  var result = data.replace(SEARCH2, REPLACE2);

  fs.writeFile(FILE, result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
});
