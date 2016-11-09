const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const stringGen = require('./lib/string_gen.js');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.render('pages/index');
});

// request for urls_index view; renders page, passing in database object
app.get('/urls', (req, res) => {
  res.render('pages/urls_index', {urls: urlDatabase});
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

// currently not in use
app.get('/urls/:id', (req, res) => {
  res.render('pages/urls_show', {shortURL: req.params.id, longURL: urlDatabase[req.params.id]});
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
