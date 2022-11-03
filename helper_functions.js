//-----------------------------------------
//| ~~ Functions for express_server.js ~~ |
//-----------------------------------------


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


// ~~~       Checks if Password exists in users object       ~~~
// ~~~ password = req.body.password | email = req.body.email ~~~

const correctPassword = (email, password) => {
  for (const user_id in users) {
    if (users[user_id].email === email) {
      if (bcrypt.compareSync(password, users[user_id].password)) {
        return true;
      }
    }
  }
  return false;
};

// ~~~      returns user_id from email     ~~~
//~~~        email = req.body.email        ~~~

const getIDFromEmail = (email) => {
  for (const user_id in users) {
    if (users[user_id].email === email) {
      return user_id;
    }
  }
};


// ~~~ Checks if Short URL exists already  ~~~
const shortURLExists = (shortURL) => {
  for (const key in urlDatabase) {
    if (key === shortURL) {
      return true;
    }
  }
  return false;
};


// ~~~ Returns URL's specific to that user ~~~
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

module.exports = { 
  urlsForUser, 
  shortURLExists, 
  getIDFromEmail, 
  correctPassword, 
  emailExists, 
  generateRandomString
}