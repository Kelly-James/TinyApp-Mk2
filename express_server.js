const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000;
const stringGen = require('./lib/string_gen.js');
const longUrlFinder = require('./lib/url_finder.js');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// middleware, which creates an object conatining response local variables
app.use(function(req, res, next) {
  if(req.cookies.userId) {
    let currentUser = userDatabase[req.cookies.userId];
    req.currentUser = currentUser;
    res.locals.currentUser = currentUser;
  } else {
    res.locals.currentUser = null;
  }
  next();
});

const userDatabase = {
  'e23456': {
    id: 'e23456',
    username: 'Elephant',
    email: 'word@word.com',
    password: 'word',
    urls: {
      'b2xVn2': 'http://www.lighthouselabs.ca'
    }
  }
};

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
  userDatabase[userId] = {
                          id: userId,
                          username: username,
                          email: email,
                          password: password,
                          urls: {}
                        };
  res.cookie('userId', userId);
  res.redirect('/');
})

// request for urls_index view;
app.get('/urls', (req, res) => {
  if(req.cookies.userId) {
    res.render('pages/urls_index');
  } else {
    res.redirect('/');
  }
});

// makes post to urls_index; invokes random string generator module, sets shortURL to return value; longURL set to request body.longURL; if statement checks for presence of 'http' prefix; adds new key/value pair to database object
app.post('/urls', (req, res) => {
  if(req.cookies.userId) {
    let shortURL = stringGen.generator();
    let longURL = req.body.longURL;
    if(!longURL.startsWith('http://')) {
      longURL = 'http://' + longURL;
    }
    res.locals.currentUser['urls'][shortURL] = longURL;
    res.redirect('/urls');
  } else {
    res.redirect('/');
  }
});

app.get('/new', (req, res) => {
  if(req.cookies.userId) {
    res.render('pages/urls_new');
  } else {
    res.redirect('/');
  }
});

// makes get request to the value of longURL for original page
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = longUrlFinder.find(shortURL);
  if(longURL) {
    res.redirect(longURL);
  } else {
    res.sendStatus(404);
  }
});

// sends request to render edit page
app.get('/urls/:id/edit', (req, res) => {
  debugger;
  if(req.cookies.userId) {
    // console.log(req.cookies.userId);
    // console.log(res.locals.currentUser.id);
    let currentUser = res.locals.currentUser;
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

// 403 error pages
app.get('/forbidden', (req, res) => {
  res.render('pages/error_403');
});

// makes post request to urls_index to delete a url; redirects to urls_index
app.post('/urls/:id/delete', (req, res) => {
  if(req.cookies.userId) {
    delete currentUser['urls'][req.params.id];
    res.redirect('/urls');
  } else {
    res.redirect('/');
  }
});

// makes post request to urls_index to update the longURL; redirects to urls_index
app.post('/urls/:id/update', (req, res) => {
  if(req.cookies.userId) {
    let shortURL = req.params.id;
    let longURL = req.body.longURL;
    if(!longURL.startsWith('http://')) {
      longURL = 'http://' + longURL;
    }
    currentUser['urls'][shortURL] = longURL;
    res.redirect('/urls');
  } else {
    res.redirect('/');
  }
});

app.post('/login', (req, res) => {
  let foundUser = Object.keys(userDatabase)
                        .find(function(userId, i, userNames) {
    return userDatabase[userId].username === req.body.username;
  });
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

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
