// Import express
const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");
const rateLimit = require("express-rate-limit");

// Create the express application
const app = express();

// ==========================================
//            SECURITY MIDDLEWARE
// ==========================================

// Helmet — sets secure HTTP headers
// Prevents: XSS, clickjacking, MIME sniffing attacks
app.use(helmet());

// Morgan — logs every request in terminal
// "dev" format: GET /api/doctors 200 12.345 ms
app.use(morgan("dev"));

// Rate Limiting — prevent brute force and DDoS
// Max 100 requests per IP per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // max 100 requests per window
  message: {
    message: "Too many requests, please try again after 15 minutes",
  },
});
app.use("/api", limiter); // apply only to /api routes

// Stricter limiter for auth routes (prevent password brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,  // only 20 login/register attempts per 15 min
  message: {
    message: "Too many login attempts, please try again after 15 minutes",
  },
});
app.use("/api/auth", authLimiter);

// ==========================================
//            CORS + BODY PARSING
// ==========================================

// CORS — allows frontend to call this backend
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// This allows Express to read JSON from request body
// Without this, req.body will always be undefined
app.use(express.json());

// This allows Express to read form data from request body
app.use(express.urlencoded({ extended: true }));

// ==========================================
//            TEST ROUTE
// ==========================================

// This is a simple GET route to test if server is working
// When someone visits http://localhost:5000/  they get this response
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hospital API is running",
  });
});

// ==========================================
//            API ROUTES
// ==========================================

const authRoutes        = require("./routes/authRoutes");
const userRoutes        = require("./routes/userRoutes");
const doctorRoutes      = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

app.use("/api/auth",         authRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/doctors",      doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

// ==========================================
//         ROUTE NOT FOUND HANDLER
// ==========================================

// This runs if no route above matched the request
// It must be AFTER all routes
// _req means: "I know req exists but I don't need it here"
app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ==========================================
//         GLOBAL ERROR HANDLER
// ==========================================

app.use((err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // In development: send full error details
  // In production: send clean error message only
  if (process.env.NODE_ENV === "production") {
    // Don't leak error details in production
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : "Something went wrong",
    });
  } else {
    // Development: full error for debugging
    console.error("ERROR:", err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }
});

// Export app so server.js can use it
module.exports = app;
