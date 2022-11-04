// ~~~ Import Functions from helper_functions.js ~~
const { urlsForUser } = require('./helper_functions');
const { shortURLExists } = require('./helper_functions');
const { getIDFromEmail } = require('./helper_functions');
const { correctPassword } = require('./helper_functions');
const { emailExists } = require('./helper_functions');
const { generateRandomString } = require('./helper_functions');

// ~~~ Dependancies ~~~
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');


// ~~~ EJS Template Set Up ~~~
app.set('view engine', 'ejs');


// ~~~ Middleware Set Up ~~~
app.use(express.urlencoded({ extended: true }));
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

//Routes the initial connection to the login page
app.get('/', (req, res) => {
  res.redirect('/login')
})

//routes to the main url page
app.get('/urls', (req, res) => {
  //if user is not logged in, show a modified page with login/register buttons
  if (!req.session.user_id) {
    const templateVars = {user: false};
    return res.render('urls_index', templateVars);
  }
  //if user is logged in, show the urls they've created in a list
  const userURLS = urlsForUser(req.session.user_id.id, urlDatabase);
  const templateVars = { urls: userURLS, user: req.session.user_id };
  return res.render('urls_index', templateVars);
});

//route connected to create new url form
app.post("/urls", (req, res) => {
  //if not logged in, produce error message to login/register
  //only users can create new urls
  if (!req.session.user_id) {
    return res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to create a shortened URL");
  }
  //when URL is created, create new id and input related data into our database object 
  let id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.user_id.id };
  //redirect to the new URL show page
  return res.redirect(`/urls/${id}`);
});

//routes to page where users can creat short urls
app.get("/urls/new", (req, res) => {
  //if not logged in, redirect to login page
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  //if logged in, store cookie data for use when url is created
  const templateVars = { user: req.session.user_id };
  return res.render("urls_new", templateVars);
});

//routes to individual url page where users can veiw/edit shortened urls
app.get('/urls/:id', (req, res) => {
  //if user is not logged in, provide message to login/register
  if (!req.session.user_id) {
    return res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to create a shortened URL");
  }
  //if url id does not exist, produce releavnt message
  if (urlDatabase[req.params.id] === undefined){
    return res.send("Error: short URL Id is undefined, please check ID or <a href='/urls'>Go back</a>");
  }
  //if user does not own/created short url ID, provide them with relevant message
  if (urlDatabase[req.params.id].userID !== req.session.user_id.id) {
    return res.send("Error: Only the owner can veiw their URLS, <a href='/urls'>Go back</a>");
  }
  //retrieve data from database to show in ejs
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: req.session.user_id  };
  return res.render('urls_show', templateVars);
});

//route for edit button to view/edit urls
app.post('/urls/:id', (req, res) => {
  //if not logged in, provide relevant message
  if (!req.session.user_id) {
    return res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to edit a shortened URL");
  }
  //if user is not owner/creater of url, provide relevant message
  if (urlDatabase[req.params.id].userID !== req.session.user_id.id) {
    return res.send("Error: Only the User can edit their URLS, <a href='/login'>Go back</a>");
  }
  //reassign new long url to shortened url ID in edit page then redirect back to main page
  urlDatabase[req.params.id].longURL = req.body.newLongURL;
  return res.redirect('/urls');
});

//route for deleting urls
app.post('/urls/:id/delete', (req, res) => {
  //if user is not logged in, provided relevant message
  if (!req.session.user_id) {
    return res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to delete a shortened URL");
  }
  //if user is logged in and is not owner/creator of url, provide relevant message
  if (urlDatabase[req.params.id].userID !== req.session.user_id.id) {
    return res.send("Error: Only the User can delete their URLS, <a href='/login'>Go back</a>");
  }
  //If user owns/created url, delete url from database and ejs list
  delete urlDatabase[req.params.id];
  return res.redirect('/urls');
});

//redirects users via short url id to url destination
app.get("/u/:id", (req, res) => {
  //if user tries to redirect to an invaild url
  if (!shortURLExists(req.params.id, urlDatabase)) {
    return res.send("Short Url does not exist, <a href='/urls'>Go back</a>");
  }
  //redirects user to vaid url from short url id
  const longURL = urlDatabase[req.params.id].longURL;
  return res.redirect(longURL);
});

//routes to login page
app.get('/login', (req, res) => {
  //if user is already logged in, redirect them to main page
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  
  const templateVars = { user: req.session.user_id };
  return res.render('urls_login', templateVars);
});

//post route for login form on login page
app.post('/login', (req, res) => {
  //if user tries to login with an email that doesn't exists, provide error code and relevant message
  if (!emailExists(req.body.email, users)) {
    return res.status(403).send("Error 403, Invaild Email or Password, <a href='/login'>Go back</a>");
  }
  //if user provides an incorrect password for associated email, provide error code and relevant message 
  if (!correctPassword(req.body.email, req.body.password, users)) {
    return res.status(403).send("Error 403, Invaild Email or Password, <a href='/login'>Go back</a>");
  }

  //finds user's specific id from provided email once verified with password and asigns users id to cookie
  // then redirects to main page
  const user_id = getIDFromEmail(req.body.email,users);
  req.session.user_id = users[user_id];
  return res.redirect('/urls');
});

//route deletes cookie session when logot button is clicked and redirects to login page
app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/login');
});

//routes user to register page
app.get('/register', (req, res) => {
  //if user is already logged in, reroute to main page 
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  //renders register page
  const templateVars = { user: req.session.user_id };
  return res.render('urls_register', templateVars);
});

//route recieves data from register form on register page
app.post('/register', (req, res) => {
  //if either of the text inputs are left blank, provide error message and relevant message
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send("400 Error, Please enter vaild login credentials, <a href='/login'>Go back</a>");
  }
  //if registered email address already exists, provide error code and relevant message
  if (emailExists(req.body.email, users)) {
    return res.status(400).send("400 Error, Email already exists <a href='/login'>Go back</a>");
  }

  //organize password into variable and hash's it to encode it.
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //generates random id and assigns it to new user
  const id = 'ID' + generateRandomString();

  //submits new user information into database object for referance
  users[id] = {
    id: id,
    email: req.body.email,
    password: hashedPassword
  };

  //sets cookie session to user id and redirects to main page
  req.session.user_id = users[id];
  return res.redirect('/urls');
});

//Provides message if user inputs any route that has not been included and directs them to login or create an account.
app.get('*', (req, res) => {
  return res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to create a shortened URL")
});

//provides message to terminal upon succsessful connection
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});



