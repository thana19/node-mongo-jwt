const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    surname: {
        type: String,
        require: true
    },
}, {
    timestamp: true,
    versionKey: false
  
})

const UserModel = mongoose.model("User", userSchema)
module.exports = UserModel