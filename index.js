const Fastify = require('fastify')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const hostname = 'localhost'
const port = 3000

const Product = require('./product')
const User = require('./user')

const app = Fastify({
    logger: true
})

mongoose.connect('mongodb://usr:secure@127.0.0.1:27018/test', {
   useNewUrlParser: true, 
   useCreateIndex: true,
   useUnifiedTopology: true 
})

app.get('/', (request, reply) => {
    reply.send('OK')
  })

app.get('/products', async (request, reply) => {
    const products = await Product.find().lean()
    reply.send(products)
})

app.post('/products', async (request, reply) => {
    const body = request.body
 
      const product = new Product(body)
      await product.save()
      reply.send(product)
 
})

app.get('/users', async (request, reply) => {
    const users = await User.find().lean()
    reply.send(users)
})

const generatePassword = async (password) => {
    const setRounds = 10
    const salt = await bcrypt.genSalt(setRounds)
    const passwordHashed = await bcrypt.hash(password, salt)
    return passwordHashed
}

app.post('/users', async (request, reply) => {
    const doc = request.body
    doc.password = await generatePassword(request.body.password)

    const user = new User(doc)
    await user.save()
    reply.send(user)
  
  })

app.listen(port, hostname, () => {
    console.log(`inside create server #port= ${port}`)
})