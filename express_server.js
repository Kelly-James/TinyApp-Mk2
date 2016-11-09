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

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok')
});

app.get('/urls/new', (req, res) => {
  res.render('pages/urls_new');
});

app.get('/urls/:id', (req, res) => {
  res.render('pages/urls_show', {shortURL: req.params.id, longURL: urlDatabase[req.params.id]});
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
