/**
 * Created by ivannodejs on 6/03/16.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var modelXBee = require('../models/xbee.js');
var modelXBeeNet = require('../models/xbeenets.js');
var jwt = require('jwt-simple');
var fs= require('fs');
var moment = require('moment');
var app= express();
var privateKey = fs.readFileSync('private/private.pem');
app.set('jwtTokenSecret', privateKey);

//Peticiones HTTP
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
router.post('/', function(req,res,next) {//Dar de Alta un XBeePAN with XBeeNet
    try {
        var decoded = jwt.decode(req.body.token, app.get('jwtTokenSecret'));
        console.log(" Token decoded :" + decoded.iss + "\n Owner: "+req.body.owner+ "\n Date Token: "+decoded.exp+ "\n Date Now(): "+Date.now());
        if(decoded.exp>= Date.now()) {
            if (decoded.iss == req.body.owner) {
                modelXBee.findOne({mac: req.body.mac}, function (err, xbee) {
                    if (!err) {
                        if (xbee != null)  res.status(409).json({messageAddXBeePAN: 'Exist XBeePAN'});
                        else {
                            modelXBeeNet.create({mac: req.body.xbeenet,xbeepan:req.body.mac,owner: req.body.owner,connect: false},function(err, xbeenet){
                               if(err)console.log(err);
                                console.log("Created XBeeNET");
                               modelXBee.create({mac: req.body.mac,owner: req.body.owner,xbeenet:  req.body.xbeenet},function(err, xbee){
                                    if(err)console.log(err);
                                   console.log("Created XBeePAN");
                                   res.status(200).json(xbee);
                                });
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
               var xbeesend={
                   xbeepan:"",
                   xbeenet:""
           };
               modelXBee.findOne({mac:req.params.mac}, function(err,xbee){
                        if(!err){
                            if(xbee==null) res.status(404).json({MessageDarAltaXBeeNET: "No encontrado XBeePAN"});
                            modelXBee.update({mac: req.params.mac}, {$addToSet: {xbeenet:req.body.xbeenet}}, function (err, xbee) {
                                if (err) res.status(500).json(err);
                            });
                            modelXBee.findOne({mac: xbee.mac}, function(err,xbee){
                                if (err) res.status(500).json(err);
                                xbeesend.xbepan=xbee;
                            });
                        }else res.json(err);
                    });
               modelXBeeNet.findOne({mac: req.params.mac}, function (err, xbeenet) {
                   if (!err) {
                       console.log("XBeePAN: " + xbeenet);
                       if (xbeenet != null)  res.status(409).json({messageAddXBeePAN: 'Exist XBee'});
                       else {
                           modelXBeeNet.create({mac: req.params.mac, owner: req.body.owner}, function (err, xbeenet) {
                               if (err) res.jsonp(err);
                               xbeesend.xbeenet=xbeenet;
                               res.status(200).json(xbeesend);
                           });
                       }
                   }
                   else res.json(err);
               })
           } else res.status(401).json({messageAddXBeeNET: "Unauthoritzed, this token isn't this session"});
       } else res.status(401).json({messageAddXBeeNET: "Unauthoritzed,token is old"});
   }catch (err){res.status(401).json({err:err,messageAddXBeeNET: "Unauthoritzed"});}
});//Dar de Alta un XBeeNet
router.post('/xbeepan/history', function(req,res){//Añadir registro de historial
    modelXBee.findOne({mac:req.body.mac}, function(err,xbee){
        var response={
            request: ""
        };
        console.log("Add History");
            if(!err) {
                console.log("Xbee: "+xbee);
                if(xbee==null) res.status(404).json({MessageHistoryXBeeNET: "No encontrado XBeePAN"});
                modelXBee.update({mac: req.body.mac}, {$addToSet: {history: req.body.history}}, function (err) {
                    if (err) res.status(500).json(err);
                });
                modelXBeeNet.findOne({mac: req.body.macnet}, function(err,xbeenet){
                    console.log("XbeeNet: "+xbeenet);
                    if (err) res.status(500).json(err);
                    if(xbeenet==null) res.status(404).json({MessageHistoryXBeeNET: "No encontrado XBeNET"});
                    modelXBeeNet.update({mac: req.body.macnet}, {connect: true}, function (err) {
                        response.request="XBee Not found";
                        if (err) res.status(500).json(response)
                    });
                });

                modelXBee.findOne({mac: req.body.mac}, function(err,xbeesend){
                    console.log("XBEESEND: "+xbeesend);
                    response.request="ok";
                    res.status(200).json(response);
                });
                res.status(200);
            }
            else res.status(500).json(err);
    })

});//Añadir registro de historial
router.post('/auth/xbeenet',function(req, res){//Autenticar XBeeNET
    modelXBee.findOne({mac:req.body.mac}, function(err,xbee){
        console.log("XBee: "+xbee);
        if(!err){
            if(xbee==null) res.status(404).json({MessageAuthXBeeNet: "No encontrado XBeePAN"});
            else if(xbee.xbeenet.indexOf(req.body.macnet)==-1)res.status(404).json({request: "access denied"});
            else res.status(200).json({request: "access"});
        }else res.status(500).json(err);
    })
});//Authenticar XBeeNet
router.post('/xbeenet/hellotime', function(req,res){
   modelXBee.findOne({mac:req.body.mac}, function(err,xbee){
       console.log("XBee: "+xbee);
       if(!err){
           if(xbee!=null) res.status(404).json({MessageHelloTime: "No encontrada XBeePAN"});
           else if(xbee.xbeenet.indexOf(req.body.macnet)==-1)res.status(404).json({MessageHelloTime: "XBeePAN sin XBeeNET"});
           else{
               modelXBeeNet.update({mac: req.body.macnet}, {connect: false}, function (err) {
                   if (err) res.status(500).json(err);
                   console.log("XBEE @"+req.body.macnet+" desconectada!!");
                   res.status(200);
               });
           }
       }else res.status(500).json(err);
   })
});//Cambiar XBeeNET a No Conctado
//DELETE-------------------------------
router.delete('/:mac', function(req,res,next){//Dar de baja XBeePAN
    try{
        var decoded = jwt.decode(req.body.token, app.get('jwtTokenSecret'));
        console.log(" Token decoded :" + decoded.iss + "\n Owner: "+req.body.owner+ "\n Date Token: "+decoded.exp+ "\n Date Now(): "+Date.now());
        if(decoded.exp>= Date.now()) {
            if (decoded.iss == req.body.owner) {
                modelXBee.findOne({mac:req.params.mac}, function(err,xbee){
                    if(!err){
                        if(xbee==null) res.status(404).json({MessageDarBajaXBeePAN: "No encontrado XBeePAN"});
                        else if(xbee.owner==req.body.owner){
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
                        if(xbee==null) res.status(404).json({MessageDarBajaXBeeNet: "No encontrado XBeeNET"});

                        else if(xbee.owner==req.body.owner){
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