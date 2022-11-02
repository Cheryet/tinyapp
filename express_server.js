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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase, user: req.cookies['user_id'] };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies['user_id']
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies['user_id']  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.newLongURL;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
  const templateVars = { user: req.cookies['user_id'] };
  res.render('urls_login', templateVars);

});

app.post('/login', (req, res) => {

  if (!emailExists(req.body.email, users)){
    return res.status(403).send('Error 403, Invaild Email or Password')
  }

  if (!correctPassword(req.body.email, req.body.password)){
    return res.status(403).send('Error 403, Invaild Email or Password')
  }

  res.cookie('user_id', getIDFromEmail(req.body.email))
  res.redirect('urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/login')
  
});

app.get('/register', (req, res) => {
  const templateVars = { user: req.cookies['user_id'] };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('400 Error, Please enter vaild login credentials');
  }

  if (emailExists(req.body.email, users)) {
    res.status(400).send('400 Error, Email already exists');
  }

  let id = 'ID' + generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  };
  console.log(users);
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

// ~~~          Function to check if Password exists         ~~~
// ~~~                      in users Object.                 ~~~
// ~~~ password = req.body.password | email = req.body.email ~~~
const correctPassword = (email, password) => {
  for (const user_id in users){
    if (users[user_id].email === email){
      if (users[user_id].password = password){
        return true;
      }  
    }
  }
  return false;
}

// ~~~ Function to get user_id from email  ~~~
//~~~        email = req.body.email        ~~~
const getIDFromEmail = (email) => {
  for (const user_id in users) {
    if (users[user_id].email === email){
      return user_id;
    }
  }
};



