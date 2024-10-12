import FastifyCookie from '@fastify/cookie'
import fastifyMultipart from '@fastify/multipart'
import { FastifyAdapter } from '@nestjs/platform-fastify'

const app: FastifyAdapter = new FastifyAdapter({
  trustProxy: true,
  logger: false
})
app.register(fastifyMultipart, {
  limits: {
    fields: 10, // Max number of non-file fields
    fileSize: 1024 * 1024 * 6, // limit size 6M
    files: 5 // Max number of file fields
  }
})

app.register(FastifyCookie, {
  secret: 'secret'
})

app.getInstance().addHook('onRequest', (req, reply, done) => {
  const { origin } = req.headers
  if (!origin) req.headers.origin = req.headers.host
  // 根据 logsId 生成方式，这里可以做一些处理

  const { url } = req

  req.logsId = createLogsId(url)

  if (url.endsWith('.php')) {
    reply.raw.statusMessage = 'Eh. PHP is not support on this machine. Yep, I also think PHP is bestest programming language. But for me it is beyond my reach.'

    return reply.code(418).send()
  }

  // skip favicon request
  if (url.match(/favicon.ico$/) || url.match(/manifest.json$/)) return reply.code(204).send()

  done()
})

export { app as FastifyApp }
