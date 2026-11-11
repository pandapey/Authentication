import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./db/connectDB.js";

dotenv.config();

const port = process.env.PORT || 3000;

try {
  await connectDB();
} catch (error) {
  console.log(`Failed to connect to MongoDB, exiting: ${error.message}`);
  process.exit(1);
}

app.listen(port, () => {
  console.log(`server running: http://localhost:${port}/`);
});
