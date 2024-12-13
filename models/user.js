//Referencing MongoDB_Activities_Source_Code

const db = require("../db");

const userSchema = new db.Schema({
    name: String,
    email: String,
    password: String
});

const User = db.model("User", userSchema);

module.exports = User;
