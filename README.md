[![buidler](https://buidler.dev/buidler-plugin-badge.svg?1)](https://buidler.dev)

# buidler-preprocessor

_This plugin allows to pre-preocess contract source code before compilation_

[Buidler](http://getbuidler.com) preprocessor plugin.

## What

This plugin allow you to specify a function that is executed on every line of all contracts so that you can pre-process the code.

A typical example (included) is to remove console.log for production ready contracts.

Note that this plugin do not touch the filesystem. It happens in memory.

## Installation

```bash
npm install buidler-preprocessor
```

And add the following statement to your `buidler.config.js`:

```js
usePlugin('buidler-preprocessor');
```

## Required plugins

Nothing required

## Tasks

No new tasks but it overrides the `compile` task.

## Environment extensions

No extra fields added to the envirobment.

## Configuration

This plugin extends the `BuidlerConfig` with one new field: `preprocess`

This field is an object with a field : `eachLine` that itself is a function that accept the BRE as argument and must return either a function or a promise to a function.

That function exepect a string as argument (a line of a contract) and must return a string.

Note that instead of returning (or resolving a function), it is possible to return undefined to skip the preprocessing entirely.

Basic example that add a comment on each line:

```js
usePlugin('buidler-preprocessor');
module.exports = {
  preprocess: {
    eachLine: (bre) => (line) => line + '// comment at the end of each line',
  },
};
```

The plugin comes also with a preprocess function to remove `console.log` (achieving the same thing as this [plugin](https://github.com/ItsNickBarry/buidler-log-remover) but without changing the files )

You can use it as follow :

```js
usePlugin('buidler-preprocessor');
const {removeConsoleLog} = require('buidler-preprocessor');
module.exports = {
  preprocess: {
    eachLine: removeConsoleLog((bre) => bre.network.name !== 'buidlerevm' && bre.network.name !== 'localhost'),
  },
};
```

In this example the preprocessing do not happen when used against buidlerevm (testing) or localhost

## Usage

There are no additional steps you need to take for this plugin to work.

## TypeScript support

You need to add this to your `tsconfig.json`'s `files` array:
`"node_modules/buidler-preprocessor/src/type-extensions.d.ts"`
