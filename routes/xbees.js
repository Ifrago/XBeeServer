/**
 * Created by ivannodejs on 6/03/16.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var modelXBee = require('../models/xbee.js');
var jwt = require('jwt-simple');
var fs= require('fs');
var moment = require('moment');
var app= express();
var privateKey = fs.readFileSync('private/private.pem');
app.set('jwtTokenSecret', privateKey);

//Peticiones HTTP REVISAR AL FINAL CUANDO TODO FUNCIONE  USAR TOKETNS

//GET---------------------
router.get('/all', function(req, res, next){//GET Al XBees
    modelXBee.find(function(err,xbees){
        console.log(xbees);
        if(err) res.status(500).json(err);
        res.status(200).json(xbees);
    })
});
router.get('/:mac', function(req,res,next){//GET XBee
    console.log(req.params.mac);
    modelXBee.findOne({mac: req.params.mac}, function(err,xbee){
        if(!err){
            console.log('XBee: '+xbee);
            res.status(200).json(xbee);
        }else res.status(500).json(err);

    })
});

//POST----------------------
router.post('/', function(req,res,next) {//Dar de Alta un XBeePAN
    try {
        var decoded = jwt.decode(req.body.token, app.get('jwtTokenSecret'));
        console.log(" Token decoded :" + decoded.iss + "\n Owner: "+req.body.owner+ "\n Date Token: "+decoded.exp+ "\n Date Now(): "+Date.now());
        if(decoded.exp>= Date.now()) {
            if (decoded.iss == req.body.owner) {
                modelXBee.findOne({mac: req.body.mac}, function (err, xbee) {
                    if (!err) {
                        console.log("XBeePAN: " + xbee);
                        if (xbee != null)  res.status(409).json({messageAddXBeePAN: 'Exist XBee'});
                        else {
                            modelXBee.create({mac: req.body.mac, owner: req.body.owner}, function (err, xbee) {
                                if (err) res.jsop(err);
                                res.status(200).json(xbee);
                            });
                        }
                    }
                    else res.json(err);
                })
            } else res.status(401).json({messageAddXBeePAN: "Unauthoritzed, this token isn't this session"});
        } else res.status(401).json({messageAddXBeePAN: "Unauthoritzed,token is old"});
    } catch (err){res.status(401).json({err:err,messageAddXBeePAN: "Unauthoritzed"});}

});//Dar de Alta un XBeePAN
router.post('/:mac', function(req,res,next){//Dar de Alta un XBeeNet

   try{
       var decoded = jwt.decode(req.body.token, app.get('jwtTokenSecret'));
       console.log(" Token decoded :" + decoded.iss + "\n Owner: "+req.body.owner+ "\n Date Token: "+decoded.exp+ "\n Date Now(): "+Date.now());
       if(decoded.exp>= Date.now()) {
           if (decoded.iss== req.body.owner) {
               modelXBee.findOne({mac:req.params.mac}, function(err,xbee){
                        if(!err){
                            modelXBee.update({mac: req.params.mac}, {$addToSet: {xbeenet:req.body.xbeenet}}, function (err, xbee) {
                                if (err) res.status(500).json(err);
                            });
                            modelXBee.findOne({mac: xbee.mac}, function(err,xbee){
                                if (err) res.status(500).json(err);
                                res.status(200).json(xbee);
                            });
                        }else res.json(err);
                    })
           } else res.status(401).json({messageAddXBeeNET: "Unauthoritzed, this token isn't this session"});
       } else res.status(401).json({messageAddXBeeNET: "Unauthoritzed,token is old"});
   }catch (err){res.status(401).json({err:err,messageAddXBeeNET: "Unauthoritzed"});}
});//Dar de Alta un XBeeNet

//PUT-----------------------------
router.post('/history', function(req,res,next){//Añadir registro de historial
    modelXBee.findOne({mac:req.body.mac}, function(err,xbee){
            if(!err) {
                modelXBee.update({mac: req.body.mac}, {$addToSet: {history: req.body.history}}, function (err, xbee) {
                    if (err) res.status(500).json(err);
                });
                modelXBee.findOne({mac: xbee.mac}, function(err,xbee){
                    if (err) res.status(500).json(err);
                    res.status(200).json(xbee);
                });
            }
            else res.status(500).json(err);
    })

});//Añadir registro de historial

//DELETE-------------------------------
router.delete('/:mac', function(req,res,next){//Dar de baja XBeePAN
    try{
        var decoded = jwt.decode(req.body.token, app.get('jwtTokenSecret'));
        console.log(" Token decoded :" + decoded.iss + "\n Owner: "+req.body.owner+ "\n Date Token: "+decoded.exp+ "\n Date Now(): "+Date.now());
        if(decoded.exp>= Date.now()) {
            if (decoded.iss == req.body.owner) {
                modelXBee.findOne({mac:req.params.mac}, function(err,xbee){
                    if(!err){
                        if(xbee.owner==req.body.owner){
                            console.log("Eliminando XBee NET...");
                            modelXBee.update({mac: req.params.mac}, {$pop: {xbeenet: xbee.xbeenet}}, function(err){
                                if(err) res.status(500).json(err);
                                else console.log("Success!");
                            });
                            console.log("Eliminado XBeePAN...");
                            modelXBee.remove({mac: req.params.mac}, function(err){
                                if(err) res.status(500).json(err);
                                else {
                                    console.log("Success!");
                                    res.status(200).json({messageDeleteXBeePAN: "Success!"});
                                }

                            })
                        }else res.status(401).json({messageDeleteXBeePAN:"You aren't owner this XBee"});
                    }else res.status(500).json(err);
                });
            } else res.status(401).json({messageDeleteXBeePAN: "Unauthoritzed, this token isn't this session"});
        } else res.status(401).json({messageDeleteXBeePAN: "Unauthoritzed,token is old"});
    }catch (err){res.status(401).json({err:err,messageDeleteXBeePAN: "Unauthoritzed"});}
});//Dar de baja XBeePAN
router.delete('/:mac/xbeenet', function(req,res,next){//Dar de baja XBeeNET
    try{
        var decoded = jwt.decode(req.body.token, app.get('jwtTokenSecret'));
        console.log(" Token decoded :" + decoded.iss + "\n Owner: "+req.body.owner+ "\n Date Token: "+decoded.exp+ "\n Date Now(): "+Date.now());
        if(decoded.exp>= Date.now()) {
            if (decoded.iss == req.body.owner) {
                modelXBee.findOne({mac:req.params.mac}, function(err,xbee){
                    if(!err){
                        if(xbee.owner==req.body.owner){
                            console.log("Eliminando...");
                            modelXBee.update({mac: req.params.mac}, {$pop: {xbeenet: req.body.xbeenet}}, function(err){
                                if(err) res.status(500).json(err);
                                else {
                                    console.log("Eliminado");
                                    res.status(200).json({messageDeleteXBeeNET: 'Success!'});
                                }
                            });
                        }else res.status(401).json({messageDeleteXBeeNET:"You aren't owner this XBee"});
                    }else res.status(500).json(err);
                });
            } else res.status(401).json({messageDeleteXBeeNET: "Unauthoritzed, this token isn't this session"});
        } else res.status(401).json({messageDeleteXBeeNET: "Unauthoritzed,token is old"});
    }catch (err){res.status(401).json({err:err,messageDeleteXBeeNET: "Unauthoritzed"});}
});//Dar de baja XBeeNET


module.exports = router;