const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



function generateRandomString(stringLength, characters) {
  let newString = '';
  for (let i = stringLength; i > 0; i --) {
    newString += characters[Math.floor(Math.random() * characters.length)];
  }
  return newString;
};
generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz1234567890');
//Was confused about this function and researched for better understaining -- > (Reference: https://www.geeksforgeeks.org/generate-random-alpha-numeric-string-in-javascript/)




const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};




app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars);
});

//POST to generate random short URL for a given long URL
app.post('/urls', (req, res) => {
  let value = req.body.longURL;
  let key = generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz1234567890');
 urlDatabase[key] =  value;
 res.redirect(`/urls/${key}`);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render('urls_show', templateVars);
});

//POST request to update URL resource in the database
app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newLongURL
  res.redirect(`/urls`);
});

//POST request to delete an existing URL key: value pair from database
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
});

//POST route to handle username submission and store in cookie
app.post('/login', (req, res) => {
  let userName = req.body.username;
  res.cookie('username', userName);
  res.redirect('/urls');
});

//POST route to hadle logout request
app.post('/logout', (req, res) => {
  let userName = req.body.username;
  res.clearCookie('username', userName);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

