// Step 1: Load the .env file
// This must be the FIRST line so all other files can access process.env
require("dotenv").config();

// Step 2: Import the app (we will create app.js next)
const app = require("./src/app");

// Step 3: Import the database connection function
const connectDB = require("./src/config/db");

// Step 4: Read the port from .env file
// If PORT is not set, use 5000 as default
const PORT = process.env.PORT || 5000;

// Step 5: Start everything
// We use an async function because connectDB takes time
const start = async () => {
  // First connect to MongoDB
  await connectDB();

  // Then start the server
  // app.listen means: "start listening for requests on this port"
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

// Step 6: Call the start function
start();
