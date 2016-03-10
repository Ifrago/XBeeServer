/**
 * Created by ivannodejs on 6/03/16.
 */
var express = require('express');
var router = express.Router();
var db = require('../private/database');
var mongoose = require('mongoose');
var modelXBee = require('../models/xbee.js');

//Peticiones HTTP REVISAR AL FINAL CUANDO TODO FUNCIONE  USAR TOKETNS
//GET---------------------
router.get('/all', function(req, res, next){
    modelXBee.find(function(err,xbees){
        console.log(xbees);
        if(err) res.status(500).json(err);
        res.status(200).json(xbees);
    })
});
router.get('/:mac', function(req,res,next){
    console.log(req.params.mac);
    modelXBee.findOne({mac: req.params.mac}, function(err,xbee){
        if(!err){
            console.log('XBee: '+xbee);
            res.status(200).json(xbee);
        }else res.status(500).json(err);

    })
});

//POST----------------------
router.post('/', function(req,res,next){
    if(modelXBee.find({mac:req.body.mac}, function(err,xbee){
            if(!err) return xbee;
            else res.json(err);
        })) return res.status(409).json({message: 'Exist XBee'});
    else{
        modelXBee.create({mac: req.body.mac, owner: req.body.owner},function(err,xbee){
            if(err) res.jsop(err);
            res.status(200).json(xbee);
        });
    }

});
module.exports = router;