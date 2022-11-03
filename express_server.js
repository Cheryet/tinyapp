// ~~~ Import Functions from helper_functions.js ~~
const { urlsForUser } = require('./helper_functions')
const { shortURLExists } = require('./helper_functions')
const { getIDFromEmail } = require('./helper_functions')
const { correctPassword } = require('./helper_functions')
const { emailExists } = require('./helper_functions')
const { generateRandomString } = require('./helper_functions')

// ~~~ Express Server Set Up ~~~
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');


// ~~~ EJS Template Set Up ~~~
app.set('view engine', 'ejs');


// ~~~ Middleware Set Up ~~~
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));



// ~~~ JS Objects Acting as a Database ~~~

let urlDatabase = {
  "b2xVn2": {
    longURL : "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

let users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


// ~~~ Routes ~~~

app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    const templateVars = {user: false};
    return res.render('urls_index', templateVars);
  }
  const userURLS = urlsForUser(req.session.user_id.id, urlDatabase);
  const templateVars = { urls: userURLS, user: req.session.user_id };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to create a shortened URL");
  }
  let id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.user_id.id };
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = { user: req.session.user_id };
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to create a shortened URL");
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: req.session.user_id  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to edit a shortened URL");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id.id) {
    res.send("Error: Only the User can edit their URLS, <a href='/login'>Go back</a>");
  }
  urlDatabase[req.params.id].longURL = req.body.newLongURL;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.user_id) {
    res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to edit a shortened URL");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id.id) {
    res.send("Error: Only the User can edit their URLS, <a href='/login'>Go back</a>");
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  if (!shortURLExists(req.params.id, urlDatabase)) {
    res.send("Short Url does not exist, <a href='/urls'>Go back</a>");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = { user: req.session.user_id };
  res.render('urls_login', templateVars);


});

app.post('/login', (req, res) => {

  if (!emailExists(req.body.email, users)) {
    return res.status(403).send("Error 403, Invaild Email or Password, <a href='/login'>Go back</a>");
  }

  if (!correctPassword(req.body.email, req.body.password, users)) {
    return res.status(403).send("Error 403, Invaild Email or Password, <a href='/login'>Go back</a>");
  }
  const user_id = getIDFromEmail(req.body.email,users);
  req.session.user_id = users[user_id];
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
  
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = { user: req.session.user_id };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send("400 Error, Please enter vaild login credentials, <a href='/login'>Go back</a>");
  }

  if (emailExists(req.body.email, users)) {
    res.status(400).send("400 Error, Email already exists <a href='/login'>Go back</a>");
  }
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  let id = 'ID' + generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: hashedPassword
  };

  req.session.user_id = users[id];
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});



