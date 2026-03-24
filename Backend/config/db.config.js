import mongoose from "mongoose";

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Database connected successfully`);
  } catch (error) {
    console.log("Database was not connected");
    console.log(error);
  }
};

export default connect;
