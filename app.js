const express = require('express')
const mongoose = require('mongoose')

const app = express()
const port = 9000
const url = 'mongodb://127.0.0.1/WebDev'
mongoose.connect(url, { useNewUrlParser: true })

const con = mongoose.connection

con.on('open', () => {
    console.log('connected....')
})

app.use(express.json())


const userRouter = require('./routes/users')
app.use('/user',userRouter)


app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})