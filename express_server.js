// ~~~ Express Server Set Up ~~~
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');


// ~~~ EJS Template Set Up ~~~
app.set('view engine', 'ejs');



// ~~~ Middleware Set Up ~~~
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


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
  }
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies['user_id']  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.newLongURL
  res.redirect('/urls')
})

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
})

app.get('/register', (req, res) => {

res.render('urls_register', users)
});

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === ''){
    res.status
  }
  let id = 'ID' + generateRandomString();
  users[id] = {
    id: id, 
    email: req.body.email,
    password: req.body.password
  };
  console.log(users)
  res.cookie('user_id', users[id])
  res.redirect('/urls')
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// ~~~ Function to Generate Short URL'S ~~~
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

// ~~~    Function to check if Email exists    ~~~
// ~~~           In users Object.              ~~~
// ~~~ email = req.body.email | object = users ~~~

const emailExists = (email, object) => {
  for (let key in object) {
    if (object[key].email === email) {
      return false
    }
  }
}
