// to use mongoDB
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://aenriquez45:HBq6xD4jFLRWGDVZ@heartratemonitor.8dia7.mongodb.net/", { useNewUrlParser: true, useUnifiedTopology:true });

module.exports = mongoose;
