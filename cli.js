#!/usr/bin/env node

const { resolve, join } = require('path')
const { existsSync } = require('fs')
const parseArgs = require('minimist')
const Build = require('next/dist/server/build/index').default
const Export = require('./export')
const { printAndExit } = require('next/dist/lib/utils')
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    h: 'help',
    o: 'out'
  },
  boolean: ['h']
})

if (argv.help) {
  console.log(`
    Description
      Compiles and exports the application to a static website
    Usage
      $ next export <dir>
      $ next export --out <out> <dir>
    <dir> represents where the compiled folder should go.
    If no directory is provided, <dir> will be the current directory.
    <out> represents where the static directory will go.
    If no directory is provided, <out> will be <dir>/site.
  `)
  process.exit(0)
}

const dir = resolve(argv._[0] || '.')
const out = resolve(dir, argv['out'] || 'site')

// Check if pages dir exists and warn if not
if (!existsSync(dir)) {
  printAndExit(`> No such directory exists as the project root: ${dir}`)
}

if (!existsSync(join(dir, 'pages'))) {
  if (existsSync(join(dir, '..', 'pages'))) {
    printAndExit('> No `pages` directory found. Did you mean to run `next` in the parent (`../`) directory?')
  }

  printAndExit('> Couldn\'t find a `pages` directory. Please create one under the project root')
}

Build(dir)
.then(() => Export({ dir, out }))
.catch((err) => {
  console.error(err)
  process.exit(1)
})
