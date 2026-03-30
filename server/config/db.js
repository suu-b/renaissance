const mongoose = require('mongoose')
require('dotenv').config();

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected To MongoDB")
    }
    catch (error) {
        console.log("Failed to Connect", error)
        process.exit(1)
    }
}

module.exports = connectToDB 