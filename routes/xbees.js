/**
 * Created by ivannodejs on 6/03/16.
 */
var express = require('express');
var router = express.Router();
var db = require('../private/database');

//Peticiones HTTP
//GET---------------------
router.get('/', function(req, res, next){
    var message = {
        XBees: db.getAllXBees()
    };
    console.log(message);
    res.status(200).jsonp(message);
});

module.exports = router;