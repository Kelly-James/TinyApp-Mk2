const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca' ,
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/urls', (req, res) => {
  res.render('pages/urls_index', {urls: urlDatabase});
});

app.get('/urls/:id', (req, res) => {
  res.render('pages/urls_show', {shortURL: req.params.id, longURL: urlDatabase[req.params.id]});
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
