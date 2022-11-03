const { assert } = require('chai');

const { urlsForUser } = require('../helper_functions')
const { shortURLExists } = require('../helper_functions')
const { getIDFromEmail } = require('../helper_functions')
const { correctPassword } = require('../helper_functions')
const { emailExists } = require('../helper_functions')
const { generateRandomString } = require('../helper_functions')

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
    const user = getIDFromEmail("user@example.com", users)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID)
  });

  it('should return undefined if user doesnt match email', () => {
    const user = getIDFromEmail("user123@example.com", users)
    const expectedUserID = undefined;

    assert.equal(user, expectedUserID)
  })
});

describe('emailExists', function() {
  it('should return truthy if email exists', function() {
    const email = 'user2@example.com'
   
    assert.isTrue(emailExists(email, users))
  });

  it('should return falsy if email doesnt exist', () => {
    const email = '123@me.ca'

    assert.isFalse(emailExists(email, users))
  })
});

describe('shortURLExists', function() {
  it('should return truthy if the short url does exist', function() {
    const shortURL = "9sm5xK"
   
    assert.isTrue(shortURLExists(shortURL, urlDatabase))
  });

  it('should return falsy if the short URL does not exist', () => {
    const shortURL = '123456'

    assert.isFalse(shortURLExists(shortURL, urlDatabase))
  })
});

describe('urlsForUser', function() {
  it('should return all short and long urls for UserID', function() {
    const userID = "aJ48lW"
    const results = {
      "b2xVn2" : "http://www.lighthouselabs.ca",
      "9sm5xK" : "http://www.google.com"
    };
   
    assert.deepEqual(urlsForUser(userID, urlDatabase), results)
  });

  it('should return empty object if user does not exist', function() {
    const userID = "123ABC"
    const results = {};
   
    assert.deepEqual(urlsForUser(userID, urlDatabase), results)
  });
});

