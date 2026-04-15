const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // console.log(process.env.MONGO_URL)
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Database connected succesfully : ${connection.connection.host}`,
    );
  } catch (error) {
    console.error(`Error in connecting database : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
