import mongoose from "mongoose";

const connectDb = async (url: string) => {
  mongoose
    .connect(url, {
      dbName: "lawyer_marketplace",
    })
    .then((c) => console.log(`DB Connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

export default connectDb;
