/**
 * Created by ivannodejs on 28/02/16.
 */
/**
 * Created by ivannodejs on 28/02/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var xbeeSchema = new Schema({
    mac: {type:String, unique: true, required: true},
    owner:{type: String},
    history:{type: Array},
    xbeenet:{type: Array}
});

module.exports = mongoose.model('xbee',xbeeSchema);