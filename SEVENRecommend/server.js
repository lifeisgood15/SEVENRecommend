const express = require('express');
const path = require('path');
const createError = require('http-errors');
const mongoose = require('mongoose');
const bodyParser=require('body-parser');

var session = require('express-session')

 

const routes = require('./routes');
const app = express();
const PORT = 3000;
var hour = 3600000;

// Use the session middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'EXTRA SUPER SECRET TOP SECRET KEY',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  maxAge:hour
}));
mongoose.Promise= global.Promise;
mongoose.connect('mongodb://localhost/YOUR_DATABASE_NAME',{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(express.static(path.join(__dirname, './static')));


app.use('/',routes());


app.use((request, response, next) => {
  return next(createError(404, 'File not found'));
});

app.use((err, request, response, next) => {
  
  response.locals.message = err.message;
  console.error(err);
  const status = err.status || 500;
  response.locals.status = status;
  response.status(status);
  response.render('error');
});


app.listen(PORT, () => {
    console.log(`Express server listening on port http://localhost:${PORT}!`);
  });