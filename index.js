const Fastify = require('fastify')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const secretKey = '12345678'
const secretKey = process.env.SECRET_KEY

const auth = require('./auth')

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

app.listen(port, hostname, () => {
    console.log(`inside create server #port= ${port}`)
})

app.get('/', (request, reply) => {
    reply.send('OK')
})

//=============================

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

//=============================

app.get('/users', async (request, reply) => {
    const users = await User.find().lean()
    reply.send(users)
})

app.get('/users/:userId', async (request, reply) => {
    const { userId } = request.params
    // console.log('equest.params ->', request.params)
    const user = await User.findById(userId)

    reply.send(user)
})

const generatePassword = async (password) => {
    const setRounds = 10
    const salt = await bcrypt.genSalt(setRounds)
    const passwordHashed = await bcrypt.hash(password, salt)
    console.log('passwordHashed ->', passwordHashed)
    return passwordHashed
}

app.post('/users', async (request, reply) => {
    const doc = request.body
    console.log('request.body.password ->', request.body.password)

    doc.password = await generatePassword(request.body.password)

    const user = new User(doc)
    await user.save()
    reply.send(user) 
})

const comparePassword = async (password, existsPassword) => {
    const isPasswordCorrect = await bcrypt.compare(password, existsPassword)

    if (!isPasswordCorrect) {
        throw new Error('unauthrized password')
    }

    return true
}

app.post('/login', async (request, reply) => {
    const { username, password } = request.body

    const user = await User.findOne({
        username
    }) 

    if (!user) {
        throw new Error('unauthrized name')
    }
    await comparePassword(password, user.password)

    return 'Logged In'
})

//---- JWT ---------------------------------------

app.post('/login-jwt', async (request, reply) => {
    const { username, password } = request.body

    const user = await User.findOne({
        username
    }) 

    if (!user) {
        throw new Error('unauthrized name')
    }
    await comparePassword(password, user.password)

    const token = jwt.sign({
        id: user._id
    }, secretKey, {
        expiresIn: 120
    })

    return token
})

app.get('/users-jwt',{
    preHandler: [auth.validateToken]
}, async (request, reply) => {
    const users = await User.find().lean()
    reply.send(users)
})

app.get('/users-jwt/:userId',{
    preHandler: [auth.validateToken]
}, async (request, reply) => {
    const { userId } = request.params
    // console.log('equest.params ->', request.params)
    const user = await User.findById(userId)

    reply.send(user)
})
