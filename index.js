'use strict'

const PassThrough = require('readable-stream/passthrough')
const rawBody = require('raw-body')
const assert = require('assert')

// types of bodies
const types = {
  'identify': true,
  'track': true,
  'alias': true,
  'group': true,
  'page': true,
  'screen': true,
}

module.exports = function (webhooks) {
  assert(webhooks, 'A map of paths -> keys is required.')
  assert(webhooks instanceof Map, 'The webhooks must be a `Map`.')
  assert(webhooks.size > 0, 'No projects defined.')

  /**
   * Stream where all data is written to.
   *
   * ex. `require('segment-webhook').stream.pipe(require('collector-mongodb'))`
   */

  const stream = segmentWebhook.stream = new PassThrough({
    objectMode: true,
  })

  // always keep the stream flowing
  stream.resume()

  segmentWebhook.pipe = function () {
    return stream.pipe.apply(stream, arguments)
  }

  return segmentWebhook

  function* segmentWebhook(next) {
    let webhook = webhooks.get(this.path)
    if (!webhook) return yield* next

    switch (this.method) {
      case 'POST': break
      case 'OPTIONS':
        this.set('Allow', 'POST,OPTIONS')
        this.status = 204
        return
      default:
        this.set('Allow', 'POST,OPTIONS')
        this.status = 405
        return
    }

    this.assert(this.request.is('json'), 415)

    let body = yield rawBody(this.req, {
      length: this.request.length,
      encoding: 'utf8',
    })

    body = body.trim()

    try {
      body = JSON.parse(body)
    } catch (err) {
      /* istanbul ignore next */
      err.status = 400
      /* istanbul ignore next */
      throw err
    }

    this.assert(Object(body) === body, 422, 'Body must be an object.')
    this.assert(types[body.type], 400, 'Invalid body type.')

    body.project = webhook
    body.timestamp = new Date(body.timestamp)

    stream.write(body)
    stream.emit(body.type, body)

    this.status = 204
  }
}
