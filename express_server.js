const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
//const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({name: 'session',
keys: ['key1', 'key2']
}));




//Users Object
const users = {
  "randomUserOne": {
    id: "randomUserID",
    email: "user@example.com",
    password: "$2b$10$DXG/ne.DGRUYBXtwmWpqsOFKdg12fGs31zzn8YWQwZkXmsN6nzMhW"
  },
  "randomUserTwo": {
    id: "randomUser2ID",
    email: "user2@example.com",
    password: "daschunds-rock"
  }
};

//NEW URL Database Object:
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  return null;
};


//Access Users Database passwords
function getUserPassword(browserPassword) {
  console.log('browser password', browserPassword);
  for (let id in users) {
    let passwordToCompare = users[id].password;
    console.log('compare password', passwordToCompare);
    if (bcrypt.compareSync(browserPassword, passwordToCompare)) {
      console.log(users[id]);
      return true;
    }
  }
  return false;
};


//Filter URLS by matching logged in userID
function filterUrlsById(userID) {
  let result = {};
  for (let shortUrls in urlDatabase) {
    let urls = urlDatabase[shortUrls]
    if (urls['userID'] === userID) {
      result[shortUrls] = urls['longURL'];
    }
  }
  return result;
};





//ROUTES

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  let userURLS = filterUrlsById(userID);
  const templateVars = { urls: userURLS, user: user };
  if (userID === undefined) {
    res.redirect('/login');
  } else {
  res.render('urls_index', templateVars);
  }
  
});

app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  const templateVars = { user: user };
  if (userID) {
  res.render('urls_new', templateVars);
  } else {
  res.redirect('/login')
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user };
  console.log(urlDatabase);
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  const templateVars = { user: user };
  res.render('urls_registration', templateVars);
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  const templateVars = { user: user };
  res.render('urls_login', templateVars);
});




//POST to generate random short URL for a given long URL
app.post('/urls', (req, res) => {
  let longURL = req.body.longURL;
  const userID = req.session.user_id;
  let value = {};
  let key = generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz1234567890');
  value['longURL'] = longURL;
  value['userID'] = userID;
 urlDatabase[key] =  value;
 res.redirect(`/urls/${key}`);
});




app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});




//POST route to handle registration form data
app.post('/register', (req, res) => {
  let bodyEmail = req.body.email;
  let bodyPassword = req.body.password;
  if (bodyEmail === '' || bodyPassword === '') {
    return res.status(400).send('Empty Value');
  } else if (getUserEmail(bodyEmail)) {
    return res.status(400).send('User already exists');
  } else {
    let id = generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz1234567890');
  let email = bodyEmail;
  let password = bodyPassword;
  let hashedPassword = bcrypt.hashSync(password, 10);
  console.log('hash password:', hashedPassword);
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  console.log('userid cookie:', users[id].id);
  req.session.user_id = users[id].id;
    res.redirect('/urls');
  }
});


//POST request to update URL resource in the database
app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  console.log('edit id', userID)
  if (userID) {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newLongURL
  res.redirect(`/urls`);
  }
  console.log("access denied");
  res.redirect('/login');
});


//POST request to delete an existing URL key: value pair from database
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
  }
  console.log("access denied");
  res.redirect('/login');
});


//POST route to handle user login and store in cookie
app.post('/login', (req, res) => {
  let bodyEmail = req.body.email;
  let bodyPassword = req.body.password;
  let userEmail = getUserEmail(bodyEmail);
  let userPassword = getUserPassword(bodyPassword);

  if (userEmail && !userPassword) {
    res.status(403).send('Incorrect Password');

  } else if (userEmail && userPassword) {
  req.session.user_id = userEmail.id;
  res.redirect('/urls');

} else {
  res.status(403).send('Account Does Not Exist');
}
});


//POST route to handle logout request
app.post('/logout', (req, res) => {
  console.log('body contents logout:', req.body.email);
  let userID = getUserEmail(req.body.email);
  req.session = null;
  // res.clearCookie('user_id', userID);
  res.redirect('/urls');
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

