'use strict'

const PassThrough = require('readable-stream/passthrough')
const request = require('supertest')
const assert = require('assert')
const app = require('koa')()

const webhooks = new Map()
webhooks.set('/webhooks/analytics', 'project')

const fn = require('..')(webhooks)
const stream = fn.stream
app.use(fn)

const server = app.listen()

describe('Segment Webhook', function () {
  it('POST /:url', function (done) {
    request(server)
    .post('/webhooks/analytics')
    .send(fixture('identify'))
    .expect(204, done)
  })

  it('stream.on(data)', function (done) {
    stream.on('data', function ondata(body) {
      if (body.type !== 'group') return

      stream.removeListener('data', ondata)
      assert(body.project === 'project')
      done()
    })

    stream.on('error', done)

    request(server)
    .post('/webhooks/analytics')
    .send(fixture('group'))
    .expect(204, noop)
  })

  it('stream.on(type)', function (done) {
    stream.once('page', function () {
      done()
    })

    stream.on('error', done)

    request(server)
    .post('/webhooks/analytics')
    .send(fixture('page'))
    .expect(204, noop)
  })

  it('fn.pipe()', function (done) {
    let passthrough = new PassThrough({
      objectMode: true,
    })

    fn.pipe(passthrough)

    passthrough.on('data', function ondata(body) {
      if (body.type !== 'group') return

      passthrough.removeListener('data', ondata)
      done()
    })

    stream.on('error', done)

    request(server)
    .post('/webhooks/analytics')
    .send(fixture('group'))
    .expect(204, noop)
  })
})

describe('Invalid Routes', function () {
  it('GET /:url -> 405', function (done) {
    request(server)
    .get('/webhooks/analytics')
    .expect(405, done)
  })

  it('OPTIONS /:url -> 204', function (done) {
    request(server)
    .options('/webhooks/analytics')
    .expect(204, done)
  })

  it('GET / -> 404', function (done) {
    request(server)
    .get('/')
    .expect(404, done)
  })
})

function fixture(name) {
  return require('./fixtures/' + name + '.json')
}

function noop() {}
