// to use mongoDB
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1/heartratemonitor", { useNewUrlParser: true, useUnifiedTopology:true });

module.exports = mongoose;
