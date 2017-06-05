
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var xbeeNetSchema = new Schema({
    mac: {type:String, unique: true, required: true},
    xbeepan: { type:String},
    owner: {type: String},
    connect: {type: Boolean}
});


module.exports = mongoose.model("xbeenets", xbeeNetSchema);