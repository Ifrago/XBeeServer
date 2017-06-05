/**
 * Created by ivannodejs on 28/02/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    modelXBeeNet = require('../models/xbeenets.js');
var xbeeSchema = new Schema({
    mac: {type:String, unique: true, required: true},
    owner:{type: String},
    history:{type: Array},
    xbeenet:{ type : Schema.Types.Array, ref : 'xbeenets' }
});

module.exports = mongoose.model('xbee',xbeeSchema);