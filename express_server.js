// ~~~ Express Server Set Up ~~~
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
//cosnt morgan = require('morgan')


// ~~~ EJS Template Set Up ~~~
app.set('view engine', 'ejs');


// ~~~ Middleware Set Up ~~~
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(morgan('dev'))


//Install Morgan - Morgan is a tracker & logger (npm i morgan)



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

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  if (!req.cookies['user_id']) {
    const templateVars = {user: false};
    res.render('urls_index', templateVars);
  }
  const userURLS = urlsForUser(req.cookies['user_id'].id);
  const templateVars = { urls: userURLS, user: req.cookies['user_id'] };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies['user_id']) {
    res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to create a shortened URL");
  }
  let id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.cookies['user_id'].id };
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/urls');
  }
  const templateVars = { user: req.cookies['user_id'] };
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!req.cookies['user_id']) {
    res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to create a shortened URL");
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: req.cookies['user_id']  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  if (!req.cookies['user_id']) {
    res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to edit a shortened URL");
  }
  if (urlDatabase[req.params.id].userID !== req.cookies['user_id'].id) {
    res.send("Error: Only the User can edit their URLS, <a href='/login'>Go back</a>");
  }
  urlDatabase[req.params.id].longURL = req.body.newLongURL;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  if (!req.cookies['user_id']) {
    res.send("Please <a href='/login'>Login</a> or <a href='/register'>register</a> to edit a shortened URL");
  }
  if (urlDatabase[req.params.id].userID !== req.cookies['user_id'].id) {
    res.send("Error: Only the User can edit their URLS, <a href='/login'>Go back</a>");
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  if (!shortURLExists(req.params.id)) {
    res.send("Short Url does not exist, <a href='/urls'>Go back</a>");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  }
  const templateVars = { user: req.cookies['user_id'] };
  res.render('urls_login', templateVars);


});

app.post('/login', (req, res) => {

  if (!emailExists(req.body.email, users)) {
    return res.status(403).send("Error 403, Invaild Email or Password, <a href='/login'>Go back</a>");
  }

  if (!correctPassword(req.body.email, req.body.password)) {
    return res.status(403).send("Error 403, Invaild Email or Password, <a href='/login'>Go back</a>");
  }
  const user_id = getIDFromEmail(req.body.email);
  res.cookie('user_id', users[user_id]);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
  
});

app.get('/register', (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  }
  const templateVars = { user: req.cookies['user_id'] };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send("400 Error, Please enter vaild login credentials, <a href='/login'>Go back</a>");
  }

  if (emailExists(req.body.email, users)) {
    res.status(400).send("400 Error, Email already exists <a href='/login'>Go back</a>");
  }

  let id = 'ID' + generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie('user_id', users[id]);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});



// ~~~ Functions ~~~


// ~~~       Generate Short URL'S       ~~~
// ~~~   Returns a 6 Character long ID  ~~~
const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// ~~~ checks if email exists in users Object  ~~~
// ~~~ email = req.body.email | object = users ~~~
const emailExists = (email, object) => {
  for (let key in object) {
    if (object[key].email === email) {
      return true;
    }
  }
  return false;
};

// ~~~          Functn to check if Password exists         ~~~
// ~~~                      in users Object.                 ~~~
// ~~~ password = req.body.password | email = req.body.email ~~~
const correctPassword = (email, password) => {
  for (const user_id in users) {
    if (users[user_id].email === email) {
      if (users[user_id].password = password) {
        return true;
      }
    }
  }
  return false;
};

// ~~~ Function to get user_id from email  ~~~
//~~~        email = req.body.email        ~~~
const getIDFromEmail = (email) => {
  for (const user_id in users) {
    if (users[user_id].email === email) {
      return user_id;
    }
  }
};

// ~~~ Function to check if shortURl exists  ~~~
const shortURLExists = (shortURL) => {
  for (const key in urlDatabase) {
    if (key === shortURL) {
      return true;
    }
  }
  return false;
};


const urlsForUser = (id) => {
  
  let results = {
  };

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      results[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return results;
};



