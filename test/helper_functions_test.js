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

describe('getIDByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getIDFromEmail("user@example.com", users)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID)
  });
});