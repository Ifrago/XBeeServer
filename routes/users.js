var express = require('express');
var router = express.Router();
var db = require('../private/database');
var mongoose = require('mongoose');
var modelUser = require('../models/users.js');
var modelXBee = require('../models/xbee.js');

//Peticiones HTTP REVISAR AL FINAL CUANDO TODO FUNCIONE  USAR TOKETNS
//GET---------------------
router.get('/all', function(req,res,next){//Get All Users
    console.log('GET All User');
    modelUser.find(function(err,users){
        console.log(users);
        if(err) res.status(204).json(err);
        res.status(200).json(users);
    })
});
router.get('/:username', function(req,res,next){//GET User
    modelUser.find({username:req.params.username}, function(err,user){
        if (!err) {
            console.log('User: '+user);
            res.jsonp(user);
        } else res.jsonp(err);
    })

});

//POST---------------------
router.post('/',function(req,res,next){//Register User
  if(req.body.username=="" || req.body.userpass=="")  res.jsonp({message:"Hay campos obligaotrios vacios"});
  else{
      if(modelUser.find({username:req.body.username}, function(err,user){
              if(!err) return user;
              else res.jsonp(err);
          })) return res.status(409).json({message: 'Exist User'});
      else{
          modelUser.create({username: username, userpass: password},function(err,user){
              if(err) res.jsonp(err);
              res.status(200).json(user);
          });

      }

  }
});
//PUT-----------------------
router.put('/:username', function(req,res,next){//Modify User(userpass &/or xbeepan)
    if(req.body.userpass!="" && req.body.xbeepan!="") {
        modelUser.update({username: req.params.username}, {$set: {userpass: req.body.userpass, xbeepan: req.body.xbeepan}}, function (err, user) {
            if (err) res.status(500).json(err);
            res.status(200).json(user);
        });
    }else if(req.body.userpass=="" && req.body.xbeepan!="") {
        modelUser.update({username: req.params.username}, {$set: {xbeepan: req.body.xbeepan}}, function (err, user) {
            if (err) res.status(500).json(err);
            res.status(200).json(user);
        });
    }else if(req.body.userpass!="" && req.body.xbeepan=="") {
        modelUser.update({username: req.params.username}, {$set: {userpass: req.body.userpass}}, function (err, user) {
            if (err) res.status(500).json(err);
            res.status(200).json(user);
        });
    }else res.status(400).json({message:"Campos para cambiar vacios"});
});
router.put('/signin',function(req,res,next){//SIGNIN User
    console.log("MESSAGE- Username: "+req.body.username+" Userpass: "+ req.body.userpass);
    modelUser.findOne({username: req.body.username}, function (err, user) {
        if(err) res.status(500).json(err);
        console.log("DATABASE- Username: "+user.username+" Userpass: "+ user.userpass+ " User "+ user);
        if(req.body.username == user.username){
            if(req.body.userpass== user.userpass){
                res.status(200).json(user);
            }else res.status(401).json({message:"Userpass Wrong!"});
        }else res.status(404).json({message:"User not found in our database"});
    })
});
//DELETE---------------------
router.delete('/', function(req,res,next){//Dar de baja a un usuario (DELETE User)
    modelUser.findOne({username: req.params.username}, function (err, user) {
        if(err) res.status(500).json(err);
        console.log("DATABASE- Username: "+user.username+" Userpass: "+ user.userpass+ " User "+ user);
        if(req.params.username == user.username){
            if(req.body.userpass== user.userpass){
                modelUser.remove({username: req.params.username}, function(err){
                    if(err) res.status(500).json(err);
                    else res.status(200).json({message: 'Success!'});
                })
            }else res.status(401).json({message:"Userpass Wrong!"});
        }else res.status(404).json({message:"User not found in our database"});
    })
});
module.exports = router;
