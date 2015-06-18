var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/zoo_animal_app");
mongoose.set("debug", true);

module.exports.Animal = require("./animal");
module.exports.Zoo = require("./zoo");