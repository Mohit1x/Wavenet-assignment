const mongoose = require('mongoose')


const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('mongodb connected')
    } catch (error) {
        console.log('error connecting mongo',error)
        process.exit(1)
    }
}

module.exports = connectDB