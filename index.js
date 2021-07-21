const Fastify = require('fastify')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const FastifySwagger = require('fastify-swagger')

const config = require('./env')
const auth = require('./auth')
const User = require('./user')

const app = Fastify({
    logger: true
})

app.listen(config.port, config.hostname, () => {
    console.log(`inside create server #port= ${config.port}`)
})

app.get('/', (request, reply) => {
    reply.send('OK')
})

//Mongoose ---------------------------------------

mongoose.connect(config.mongodb.uri, {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true 
})
     
//CRUD no jwt---------------------------------------

app.get('/users-x', async (request, reply) => {
    const users = await User.find().lean()
    reply.send(users)
})

app.get('/users-x/:userId', async (request, reply) => {
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

app.post('/login-x', async (request, reply) => {
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

//JWT ---------------------------------------

app.post('/login', async (request, reply) => {
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
    }, config.secretKey, {
        expiresIn: 120
    })

    // return token
    reply.send({'message':token})
})

app.get('/users',{
    preHandler: [auth.validateToken]
}, async (request, reply) => {
    const users = await User.find().lean()
    reply.send(users)
})

app.get('/users/:userId',{
    preHandler: [auth.validateToken]
}, async (request, reply) => {
    const { userId } = request.params
    // console.log('userId ->', userId)
    const user = await User.findById(userId)

    reply.send(user)
})

//Swagger ---------------------------------------

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
