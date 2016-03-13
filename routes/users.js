var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var modelUser = require('../models/users.js');
var jwt = require('jsonwebtoken');
var fs= require('fs');
var privKey =fs.readFileSync('private/server.key');
var pubKey = fs.readFileSync('private/server.pub');


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
    modelUser.findOne({username:req.params.username}, function(err,user){
        if (!err) {
            console.log('User: '+user);
            res.jsonp(user);
        } else res.jsonp(err);
    })

});

//POST---------------------
router.post('/',function(req,res,next){//Register User
  if(req.body.username=="" || req.body.userpass=="")  res.jsonp({message:"Hay campos obligaotrios vacios"});
  else {
      modelUser.findOne({username: req.body.username}, function (err, user) {
              if (!err) {
                  if (user == null) {
                      modelUser.create({username: req.body.username, userpass: req.body.userpass}, function (err, user) {
                          if (err) res.jsonp(err);
                          res.status(200).json({
                              user: user,
                              token:jwt.sign(user.username, privKey, {algorithm: 'RS256'})
                          });
                      });
                  } else return res.status(409).json({message: 'Exist User'});
              }
              else res.jsonp(err);
          }
      );
  }
});//Register User
router.post('/:username', function(req,res,next) {//Modify User(userpass &/or xbeepan)
    try {
           var decoded = jwt.verify(req.body.token, pubKey);
            console.log(" Token decoded :" + decoded + " Username: "+req.params.username);
            if (err) res.status(401).json(err);
            if(decoded==req.params.username){
                if (req.body.userpass != "" && req.body.xbeepan != "") {
                    modelUser.update({username: req.params.username}, {
                        $set: {
                            userpass: req.body.userpass,
                            xbeepan: req.body.xbeepan
                        }
                    }, function (err, user) {
                        if (err) res.status(500).json(err);
                        res.status(200).json(user);
                    });
                } else if (req.body.userpass == "" && req.body.xbeepan != "") {
                    modelUser.update({username: req.params.username}, {$set: {xbeepan: req.body.xbeepan}}, function (err, user) {
                        if (err) res.status(500).json(err);
                        res.status(200).json(user);
                    });
                } else if (req.body.userpass != "" && req.body.xbeepan == "") {
                    modelUser.update({username: req.params.username}, {$set: {userpass: req.body.userpass}}, function (err, user) {
                        if (err) res.status(500).json(err);
                        res.status(200).json(user);
                    });}
            } else res.status(400).json({messageModify: "Unauthoritzed, token is old"});
    }catch(err){
        res.status(401).json({err: err, messageModify: "Unauthoritzed, token is invalid"});
    }});//Modify User(userpass &/or xbeepan)

router.post('/signin',function(req,res,next){//SIGNIN User
    console.log("MESSAGE- Username: "+req.body.username+" Userpass: "+ req.body.userpass);
    modelUser.findOne({username: req.body.username}, function (err, user) {
        if(err) res.status(500).json(err);
        console.log("DATABASE- Username: "+user.username+" Userpass: "+ user.userpass+ " User "+ user);
        if(req.body.username == user.username){
            if(req.body.userpass== user.userpass){
                res.status(200).json({
                    user:user,
                    token:jwt.sign(user.username, privKey, {algorithm: 'RS256'})
                });
            }else res.status(401).json({message:"Userpass Wrong!"});
        }else res.status(404).json({message:"User not found in our database"});
    })
});//SIGNIN User

//DELETE---------------------
router.delete('/:username', function(req,res,next){//Dar de baja a un usuario (DELETE User)
    try{
        var decoded = jwt.verify(req.body.token, pubKey);
        console.log(" Token decoded :" + decoded);
        if(decoded==req.params.username){
        modelUser.findOne({username: req.params.username}, function (err, user) {
            if(err) res.status(500).json(err);
            if(user==null) res.status(404).json({message:"User not found in our database"});
            else  if(req.params.username == user.username){
                console.log("DATABASE- Username: "+user.username+" Userpass: "+ user.userpass+ " User "+ user);
                if(req.body.userpass== user.userpass){
                    modelUser.remove({username: req.params.username}, function(err){
                        if(err) res.status(500).json(err);
                        else res.status(200).json({messageDelete: 'Success!'});
                    })
                }else res.status(401).json({messageDelete:"Userpass Wrong!"});
            }
        })
        }else res.status(401).json({messageDelete:"Unauthoritzed"});
    }catch(err){
        res.status(401).json({err: err, messageDelete: "Unauthoritzed"});
    }

});//Dar de baja a un usuario (DELETE User)


module.exports = router;
