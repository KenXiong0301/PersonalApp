/*
  app.js -- This creates an Express webserver
*/

// First we load in all of the packages we need for the server...
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
//const bodyParser = require("body-parser");
const axios = require("axios");
var debug = require("debug")("personalapp:server");

// Now we create the server
const app = express();

// Here we specify that we will be using EJS as our view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Here we process the requests so they are easy to handle
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Here we specify that static files will be in the public folder
app.use(express.static(path.join(__dirname, "public")));

// Here we enable session handling ..
app.use(
  session({
    secret: "zzbbya789fds89snana789sdfa",
    resave: false,
    saveUninitialized: false
  })
);

//connecting database
const mongoose = require( 'mongoose' );
//mongoose.connect( `mongodb+srv://${auth.atlasAuth.username}:${auth.atlasAuth.password}@cluster0-yjamu.mongodb.net/authdemo?retryWrites=true&w=majority`);
mongoose.connect( 'mongodb://localhost/authDemo');
//const mongoDB_URI = process.env.MONGODB_URI
//mongoose.connect(mongoDB_URI)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});

const User = require('./models/User');
const Post = require('./models/Post');
const usersRouter = require('./routes/users');
const postRouter = require('./routes/post')


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(layouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/post', postRouter)

const myLogger = (req,res,next) => {
  console.log('inside a route!')
  next()
}

//connecting database



//app.use(bodyParser.urlencoded({ extended: false }));

// This is an example of middleware
// where we look at a request and process it!
app.use(function(req, res, next) {
  //console.log("about to look for routes!!! "+new Date())
  console.log(`${req.method} ${req.url}`);
  //console.dir(req.headers)
  next();
});

// here we start handling routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/demo",
        function (req, res){res.render("demo");});

app.get("/about", (request, response) => {
  response.render("about");
});

app.get("/form", (request,response) => {
  response.render("form")
})

app.get("/dataDemo", (request,response) => {
  response.locals.name="Tim Hickey"
  response.locals.vals =[1,2,3,4,5]
  response.locals.people =[
    {'name':'Tim','age':65},
    {'name':'Yas','age':29}]
  response.render("dataDemo")
})

app.post("/showformdata", (request,response) => {
  response.json(request.body)
})

app.get('/weather', (req,res) => {
  res.render('weather')
})

app.post("/getWeather",
  async (req,res,next) => {
    try {
      const state = req.body.state
      const url = "http://api.openweathermap.org/data/2.5/weather?q="+state+"&units=imperial&APPID=d3fd7fe792d8f4a038633a7170d66256"
      const result = await axios.get(url)
      console.dir(result.data)
      const picurl = "http://openweathermap.org/img/w/"+result.data.weather[0].icon+".png"
      console.log(picurl)
      res.locals.state = state
      res.locals.pic = picurl
      res.locals.description = result.data.weather[0].description
      res.locals.temp = result.data.main.temp
      res.render('getWeather')
    } catch(error){
      next(error)
    }
})

// Here is where we will explore using forms!



// this example shows how to get the current US covid data
// and send it back to the browser in raw JSON form, see
// https://covidtracking.com/data/api
// for all of the kinds of data you can get
app.get("/c19",
  async (req,res,next) => {
    try {
      const url = "https://covidtracking.com/api/v1/us/current.json"
      const result = await axios.get(url)
      res.json(result.data)
    } catch(error){
      next(error)
    }
})

// this shows how to use an API to get recipes
// http://www.recipepuppy.com/about/api/
// the example here finds omelet recipes with onions and garlic
app.get("/omelet",
  async (req,res,next) => {
    try {
      const url = "http://www.recipepuppy.com/api/?i=onions,garlic&q=omelet&p=3"
      const result = await axios.get(url)
      res.json(result.data)
    } catch(error){
      next(error)
    }
})

// Don't change anything below here ...

// here we catch 404 errors and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// this processes any errors generated by the previous routes
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//Here we set the port to use
const port = "5000";
app.set("port", port);

// and now we startup the server listening on that port
const http = require("http");
const server = http.createServer(app);

server.listen(port);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

server.on("error", onError);

server.on("listening", onListening);

module.exports = app;
