const { assert } = require('chai');

const { urlsForUser } = require('../helper_functions');
const { shortURLExists } = require('../helper_functions');
const { getIDFromEmail } = require('../helper_functions');
const { correctPassword } = require('../helper_functions');
const { emailExists } = require('../helper_functions');
const { generateRandomString } = require('../helper_functions');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL : "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

describe('getIDByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getIDFromEmail("user@example.com", users);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
});

describe('emailExists', function() {
  it('should return truthy', function() {
    const email = 'user2@example.com';
   
    assert.isTrue(emailExists(email, users));
  });
});

describe('shortURLExists', function() {
  it('should return truthy', function() {
    const shortURL = "9sm5xK";
   
    assert.isTrue(shortURLExists(shortURL, urlDatabase));
  });
});

describe('urlsForUser', function() {
  it('should return all short and long urls for UserID', function() {
    const userID = "aJ48lW";
    const results = {
      "b2xVn2" : "http://www.lighthouselabs.ca",
      "9sm5xK" : "http://www.google.com"
    };
   
    assert.deepEqual(urlsForUser(userID, urlDatabase), results);
  });
});


