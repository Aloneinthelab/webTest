var mongoose = require('mongoose');
 
module.exports = mongoose.model('Post',{
    username: String,
    password: String,
    email: String,
    mainlanguage: String,
    languagetolearn: String
});