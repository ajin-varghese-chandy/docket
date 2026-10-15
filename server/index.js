import path from 'node:path'
import { fileURLToPath } from 'node:url'
import jsonServer from 'json-server'
import { loadEnvFile } from './env.js'
import { setupRazorpay } from './razorpay.js'
import { registerRoutes } from './routes.js'

const serverFolder = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT) || 4000


loadEnvFile(path.join(path.dirname(serverFolder), '.env'))
loadEnvFile(path.join(serverFolder, '.env'))
 
const razorpay = setupRazorpay()

const server = jsonServer.create()
const router = jsonServer.router(path.join(serverFolder, 'db.json'))

server.use(jsonServer.defaults({ bodyParser: true }))

registerRoutes(server, router, razorpay)

server.use(router)

server.listen(port, function () {
  console.log('json-server + Razorpay API on http://localhost:' + port)

  if (razorpay.isOn) {
    console.log('Razorpay enabled (' + razorpay.keyId + ')')
  } else {
    console.log(
      'Razorpay not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env to accept payments.',
    )
  }
})
