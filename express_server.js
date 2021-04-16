const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());




//URL Database Object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Users Object
const users = {
  "randomUserOne": {
    id: "randomUserID",
    email: "user@example.com",
    password: "apples"
  },
  "randomUserTwo": {
    id: "randomUser2ID",
    email: "user2@example.com",
    password: "daschunds-rock"
  }
};


//HELPER FUNCTIONS

//Generate random string
function generateRandomString(stringLength, characters) {
  let newString = '';
  for (let i = stringLength; i > 0; i --) {
    newString += characters[Math.floor(Math.random() * characters.length)];
  }
  return newString;
};
generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz1234567890');
//Was confused about this function and researched for better understaining -- > (Reference: https://www.geeksforgeeks.org/generate-random-alpha-numeric-string-in-javascript/)


//Access Users Database emails
function getUserEmail(email) {
  for (let id in users) {
    if (users[id].email === email) {
      console.log(users[id]);
      return users[id];
    }
  }
  return undefined;
};

//Access Users Database passwords
function getUserPassword(password) {
  for (let id in users) {
    if (users[id].password === password) {
      console.log(users[id]);
      return users[id];
    }
  }
  return undefined;
};




app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  console.log(user)

  const templateVars = { urls: urlDatabase, user: user };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  const templateVars = { user: user };
  if (userID) {
  res.render('urls_new', templateVars);
  }
  res.redirect('/login')
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  const templateVars = { user: user };
  res.render('urls_registration', templateVars);
});

app.get('/login', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID]
  const templateVars = { user: user };
  res.render('urls_login', templateVars);
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



//***OLD - Waiting for mentor feedback on the errors*** POST route to handle registration form data
// app.post('/register', (req, res) => {
//   let id = generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz1234567890');
//   let email = req.body.email;
//   let password = req.body.password;
//   users[id] = {
//     id,
//     email,
//     password
//   };
//   if (email === '' || password === '') {
//     console.log('empty hit');
//     return res.status(400).send("Empty value")
//   }
//   if (getUserEmail(email) === undefined) {
//     console.log('existing user');
//     res.cookie('user_id', users[id].id);
//     res.redirect('/urls');
//   } else {
//     res.status(400).send("User already exists")
//   }
// });

//POST route to handle registration form data
app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Empyt Value');
  } else if (getUserEmail(req.body.email)) {
    return res.status(400).send('User already exists');
  } else {
    let id = generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz1234567890');
  let email = req.body.email;
  let password = req.body.password;
  users[id] = {
    id,
    email,
    password
  };
  res.cookie('user_id', users[id].id);
    res.redirect('/urls');
  }
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

//POST route to handle user login and store in cookie
app.post('/login', (req, res) => {
  console.log('it hit');
  if (getUserEmail(req.body.email) && !(getUserPassword(req.body.password))) {
    res.status(403).send('Incorrect Password');
  } else if (getUserEmail(req.body.email) && getUserPassword(req.body.password)) {
    console.log(getUserEmail(req.body.email));
  res.cookie('user_id', getUserEmail(req.body.email).id);
  res.redirect('/urls');
} else {
  res.status(403).send('Account Does Not Exist');
}
});

//POST route to handle logout request
app.post('/logout', (req, res) => {
  let userID = getUserEmail(req.body.email);
  res.clearCookie('user_id', userID);
  res.redirect('/urls');
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

