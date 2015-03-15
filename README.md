
# segment-webhook

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Gittip][gittip-image]][gittip-url]

Koa middleware for [Segment Webhooks Integration](https://segment.com/docs/integrations/webhooks/).

## API

```js
const JSONStream = require('JSONStream')
const app = require('koa')()

const webhooks = new Map()
webhooks.set('/webhooks/production', 'production')
webhooks.set('/webhooks/debug', 'debug')

const webhook = require('segment-webhook')(webhooks)

app.use(webhook)

webhook.pipe(JSONStream.stringify()).pipe(process.stdout)

webhook.stream.on('data', function (obj) {
  console.log(JSON.stringify(obj))
})
```

Returns Koa middlweare.

### const fn = SegmentWebhooks(webhooks)

`webhooks` is a required `Map` of `path -> project_name`.
The `project_name` will be set on each object as `.project`.
This allows you to differentiate against different projects and environments
while using the same webhook for all of them.

### fn.pipe([dest])

Pipe all the objects into another stream.
The destination must also be in `objectMode`

### fn.stream.on('data', obj => )

Listen for all objects being passed.

### fn.stream.on(type, obj => )

Filter by data types, ex. `page`, `identify`, `track`, etc.

[npm-image]: https://img.shields.io/npm/v/segment-webhook.svg?style=flat-square
[npm-url]: https://npmjs.org/package/segment-webhook
[github-tag]: http://img.shields.io/github/tag/collectors/segment-webhook.svg?style=flat-square
[github-url]: https://github.com/collectors/segment-webhook/tags
[travis-image]: https://img.shields.io/travis/collectors/segment-webhook.svg?style=flat-square
[travis-url]: https://travis-ci.org/collectors/segment-webhook
[coveralls-image]: https://img.shields.io/coveralls/collectors/segment-webhook.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/collectors/segment-webhook
[david-image]: http://img.shields.io/david/collectors/segment-webhook.svg?style=flat-square
[david-url]: https://david-dm.org/collectors/segment-webhook
[license-image]: http://img.shields.io/npm/l/segment-webhook.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/segment-webhook.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/segment-webhook
[gittip-image]: https://img.shields.io/gratipay/jonathanong.svg?style=flat-square
[gittip-url]: https://gratipay.com/jonathanong/
