const Fastify = require('fastify')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const FastifySwagger = require('fastify-swagger')

// const secretKey = process.env.SECRET_KEY
const secretKey = '12345678'
const auth = require('./auth')

// const hostname = 'localhost'
const hostname = '0.0.0.0'
const port = 3000
// const mongoUri = 'mongodb+srv://admin:357ZNnRMtGwNUYk@cluster0.sokv7.mongodb.net/test'
// const mongoUri = 'mongodb://usr:secure@127.0.0.1:27018/test'
const mongoUri = 'mongodb://usr:secure@mongo/test'

const User = require('./user')

const app = Fastify({
    logger: false
})

app.register(FastifySwagger, {
    routePrefix: '/documents',
    swagger: {
        info: {
            title: 'Node-Mongo-JWT LLDD',
            description: 'CRUD+JWT',
            version: '1.0'
        }
    },
    exposeRoute: true
})

mongoose.connect(mongoUri, {
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
    // console.log('passwordHashed ->', passwordHashed)
    return passwordHashed
}

app.post('/users', async (request, reply) => {
    const doc = request.body
    // console.log('request.body.password ->', request.body.password)

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

app.patch('/users', async (request, reply) => {
    const {
        userId,
        name,
        surname
    } = request.body    

    const updatedUser = await User.updateOne({
        _id: userId
    } , {
        name,
        surname
    },{
        returnOriginal: false
    })
 
    reply.send(updatedUser)
})

app.delete('/users', async (request, reply) => {
    const { userId } = request.body

    const result = await User.remove({
        _id: userId
    })

    reply.send(result)    
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
