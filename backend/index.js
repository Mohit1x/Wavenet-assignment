const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()
connectDB()

const app = express()

app.use(express.json())

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server is connected on ${PORT}`)
})