// Suppress specific deprecation warning
process.removeAllListeners('warning');

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");
const Listing = require("./models/listing");

// Enable debug mode for development
if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true);
}

// MongoDB Connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Wanderlust", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error(' MongoDB connection error:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    return false;
  }
}

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

// Initialize connection
connectDB().catch(console.error);

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};
app.use(session(sessionConfig));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Home route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// 404 handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Test endpoint with improved error handling
app.get('/test-listings', async (req, res, next) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      const connected = await connectDB();
      if (!connected) {
        const error = new Error('Database connection failed');
        error.statusCode = 503;
        return next(error);
      }
    }

    console.log('Attempting to fetch listings...');
    const listings = await Listing.find({}).limit(10).lean();
    console.log('Listings found:', listings.length);
    
    if (!listings || listings.length === 0) {
      const error = new Error('No listings found');
      error.statusCode = 404;
      return next(error);
    }
    
    res.json({
      count: listings.length,
      listings: listings
    });
  } catch (err) {
    console.error('Error in /test-listings:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    err.statusCode = err.statusCode || 500;
    next(err);
  }
});

// Error handler
app.use((err, req, res, next) => {
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    console.error('Database connection error:', err);
    return res.status(503).json({ 
      error: 'Database connection error',
      message: 'Unable to connect to the database. Please try again later.'
    });
  }
  
  const { statusCode = 500, message = "Oh No, Something Went Wrong!" } = err;
  res.status(statusCode).render("error", { 
    error: {
      status: statusCode,
      message: message
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});