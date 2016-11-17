const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const stringGen = require('./lib/string_gen.js');
const longUrlFinder = require('./lib/url_finder.js');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const userDatabase = {};
const urlDatabase = {};
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: 'there is no darkness'
}));

// middleware, <-- the code above is middleware too. This comment can be moved.
app.use(function(req, res, next) {
  if(req.session.userId) { // this may not be necessary. if req.session.userId is undefined, then currentUser will be undefined which is falsey. I believe David covered this in his breakout.
    let currentUser = userDatabase[req.session.userId];
    req.currentUser = currentUser;
    res.locals.currentUser = currentUser; // Oooh! Nice use of res.locals.
  } else {
    res.locals.currentUser = null;
  }
  next();
});

// index
app.get('/', (req, res) => {
  res.render('pages/index');
});

// registration
app.get('/register', (req, res) => {
  res.render('pages/user_reg')
});

app.post('/register', (req, res) => {
  if(req.body.username && req.body.email && req.body.password) {
    let userId = stringGen.generator();
    let username = req.body.username;
    let email = req.body.email;
    let password = bcrypt.hashSync(req.body.password, 10); // it might be helpful for others reading your code, if you rename this variable to hashedPassword.
    userDatabase[userId] = {
                            id: userId,
                            username: username,
                            email: email,
                            password: password,
                            urls: {}
                          };
    req.session.userId = userId;
    res.redirect('/');
  } else {
    res.redirect('/register');
  }
})

// login/logout
app.post('/login', (req, res) => {
  let foundUser = Object.keys(userDatabase) // naming suggestion: this is not the entire user object, it's just the id. something like foundUserId might be better.
  .find(function(userId) { // nice use of find!
    return userDatabase[userId].username === req.body.username;
  });
  let passMatch = false;
  if(foundUser) {
    passMatch = bcrypt.compareSync(req.body.password, userDatabase[foundUser].password); // this is a long line of code. Might be nice to assign some of those parameters to variables to make it easier to read.
  };
  // FYI you could refactor the lines above as
  // const passMatch = foundUser && bcrypt.compareSync(...)

  if(foundUser && passMatch) {  // This is nice to read!
    req.session.userId = foundUser;
    res.redirect('/');
  } else {
    res.status(403).render('pages/error_403');
  }
});

app.post('/logout', (req, res) => {
  req.session.userId = null;
  res.redirect('/');
});

// view user_urls
app.get('/your_urls', (req, res) => {
  if(req.session.userId) {
    res.render('pages/user_urls_index');
  } else {
    res.redirect('/urls'); // would it make sense to rename this to /login?
  }
});

// makes post to user_urls; invokes random string generator module; if statement checks for presence of 'http' prefix;
app.post('/your_urls', (req, res) => {
  if(req.session.userId) {
    let shortURL = stringGen.generator();
    let longURL = req.body.longURL;
    if(!longURL.includes('://')) { // This might be better as if(!longURL.startsWith('http://')) {. You are doing this in the update route.
      longURL = 'http://' + longURL;
    }
    res.locals.currentUser['urls'][shortURL] = longURL; // this is not necessary because you are doing a redirect in this page. res.locals is just for templateVars to be passed to an ejs file that is rendered.
    urlDatabase[shortURL] = longURL;
    res.redirect('/your_urls');
  } else {
    res.redirect('/');
  }
});

// new short url
app.get('/new', (req, res) => {
  if(req.session.userId) {
    res.render('pages/urls_new');
  } else {
    res.redirect('/');
  }
});

// view edit page
app.get('/urls/:id/edit', (req, res) => {
  if(req.session.userId) {
    let currentUser = res.locals.currentUser; // Conceptually it feels cleaner to look up the data from req.currentUser instead of res.locals.currentUser
    let shortURL = req.params.id;
    let templateVars = {
      shortURL: shortURL,
      longURL: currentUser['urls'][shortURL]
    };
    res.render('pages/urls_edit', templateVars);
  } else {
    res.redirect('/');
  }
});

// update url
app.post('/your_urls/:id/update', (req, res) => {
  if(req.session.userId) {
    let shortURL = req.params.id;
    let longURL = req.body.longURL;
    if(!longURL.startsWith('http://')) {
      longURL = 'http://' + longURL;
    }
    res.locals.currentUser['urls'][shortURL] = longURL;
    res.redirect('/your_urls');
  } else {
    res.redirect('/');
  }
});

// delete url
app.post('/your_urls/:id/delete', (req, res) => {
  if(req.session.userId) {
    delete res.locals.currentUser['urls'][req.params.id];
    delete urlDatabase[req.params.id];
    res.redirect('/your_urls');
  } else {
    res.redirect('/');
  }
});

// makes get request to the value of longURL for original page
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = longUrlFinder.finder(shortURL, userDatabase);
  if(longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).render('pages/error_404');
  }
});

// list of all urls
app.get('/urls', (req, res) => {
  let urls = urlDatabase;
  res.render('pages/noUser_urls_index', {urls: urlDatabase});
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
