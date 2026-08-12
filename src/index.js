import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`⚙️ Server is running at port : ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`⚙️ Server running in fallback mode on port : ${port}`);
    });
  });
