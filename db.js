const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://akc8628026:PU2ni6pkNHMX6dpP@cluster0.w1rwgpk.mongodb.net/";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
     
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

module.exports = connectToMongo;