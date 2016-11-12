const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000;
const stringGen = require('./lib/string_gen.js');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// middleware which upon request from client, sets res.locals for currentUser and urlDatabase
app.use(function(req, res, next) {
  let currentUser = userDatabase[req.cookies.userId] || {};
  req.currentUser = currentUser;
  res.locals.currentUser = currentUser;
  let urls = urlDatabase;
  res.locals.urlDatabase = urls;
  // let shortURL = req.params.id
  // res.locals.shortURL = shortURL;
  next();
});

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const userDatabase = {};

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/register', (req, res) => {
  res.render('pages/user_reg')
});

app.post('/register', (req, res) => {
  let userId = stringGen.generator();
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  userDatabase[userId] = {id: userId,
                          username: username,
                          email: email,
                          password: password};
  res.cookie('userId', userId);
  res.redirect('/');
})

// request for urls_index view; renders page, passing in database object
app.get('/urls', (req, res) => {
  res.render('pages/urls_index');
});

// makes post to urls_index; invokes random string generator module, sets shortURL to return value; longURL set to request body; if statement checks for presence of 'http' prefix; adds new key/value pair to database object
app.post('/urls', (req, res) => {
  let shortURL = stringGen.generator();
  let longURL = req.body.longURL;
  if(!longURL.startsWith('http://')) {
    longURL = 'http://' + longURL;
  }
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.get('/new', (req, res) => {
  res.render('pages/urls_new');
});

// makes get request to the value of longURL for original page
app.get('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// sends request to render edit page
app.get('/urls/:id/edit', (req, res) => {
  // console.log(req.params.id);
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render('pages/urls_edit', templateVars);
});

// 403 error pages
app.get('/forbidden', (req, res) => {
  res.render('pages/error_403');
});

// makes post request to urls_index to delete a url; redirects to urls_index
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// makes post request to urls_index to update the longURL; redirects to urls_index
app.post('/urls/:id/update', (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  if(!longURL.startsWith('http://')) {
    longURL = 'http://' + longURL;
  }
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  // let userId = req.cookies.userId;
  // console.log(req.body);
  // console.log(userDatabase);
  // debugger;
  let foundUser = Object.keys(userDatabase)
                        .find(function(userId, i, userNames) {
    return userDatabase[userId].username === req.body.username;
  });
  // let foundUser.userId = foundUser[userId];
  // let foundUser.username = userDatabase[foundUser].username;
  // let foundUser.email = foundUser[email];
  // let foundUser.password = foundUser[password];
  debugger;
  if(foundUser && userDatabase[foundUser].password === req.body.password) {
    res.cookie('userId', foundUser);
    res.redirect('/');
  } else {
    res.status(403).redirect('/forbidden');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('userId', {path: '/'});
  res.redirect('/');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
