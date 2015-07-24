var mongoose = require('mongoose');
 
module.exports = mongoose.model('Comment',{
    username: String,
    password: String,
    email: String,
    mainlanguage: String,
    languagetolearn: String
});