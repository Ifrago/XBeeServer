/**
 * Created by ivannodejs on 28/02/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var modelXBee = require('../models/xbee.js');

var userSchema = new Schema({
    username:{type :String, unique: true, required: true},
    userpass:{type: String, required: true},
    xbeepan:{type: Schema.ObjectId, ref: modelXBee}
});

module.exports = mongoose.model('user',userSchema);