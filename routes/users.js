var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var modelUser = require('../models/users.js');
var jwt = require('jwt-simple');
var fs= require('fs');
var moment = require('moment');
var app= express();
var privateKey = fs.readFileSync('private/private.pem');
var TOKEN_EXPIRATION = 10,
    TOKEN_EXPIRATION_SEC= TOKEN_EXPIRATION * 60;
app.set('jwtTokenSecret', privateKey);


//Peticiones HTTP
//GET---------------------
router.get('/all', function(req,res){//Get All Users
    console.log('GET All User');
    modelUser.find(function(err,users){
        console.log(users);
        if(err) res.status(204).json(err);
        res.status(200).json(users);
    })
});
router.get('/:username', function(req,res){//GET User
    modelUser.findOne({username:req.params.username}, function(err,user){
        if (!err) {
            console.log('User: '+user);
            res.jsonp(user);
        } else res.jsonp(err);
    })

});

//POST---------------------
router.post('/',function(req,res){//Register User
  if(req.body.username=="" || req.body.userpass=="")  res.jsonp({message:"Hay campos obligaotrios vacios"});
  else {
      modelUser.findOne({username: req.body.username}, function (err, user) {
              if (!err) {
                  if (user == null) {
                      modelUser.create({username: req.body.username, userpass: req.body.userpass}, function (err, user) {
                          if (err) res.jsonp(err);
                          res.status(200).json({
                              user: user,
                              token: jwt.encode({
                                  iss:user.username,
                                  exp: moment().add(TOKEN_EXPIRATION,'minutes').valueOf()
                              }, app.get('jwtTokenSecret'))
                          });
                      });
                  } else return res.status(409).json({message: 'Exist User'});
              }
              else res.jsonp(err);
          }
      );
  }
});//Register User
router.post('/:username', function(req,res) {//Modify User(userpass &/or xbeepan)
    try {
        var decoded = jwt.decode(req.body.token, app.get('jwtTokenSecret'));
        console.log(" Token decoded :" + decoded.iss + "\n Username: "+req.params.username+ "\n Date Token: "+decoded.exp+ "\n Date Now(): "+Date.now());
        if(decoded.exp>= Date.now()) {
            if (decoded.iss == req.params.username) {
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
                    });
                }
            } else res.status(401).json({messageModify: "Unauthoritzed, this token isn't this session"});
        } else res.status(401).json({messageModify: "Unauthoritzed,token is old"});
    }catch(err){
        res.status(401).json({err: err, messageModify: "Unauthoritzed"});
    }
});//Modify User(userpass &/or xbeepan)

//PUT---------------------
router.put('/signin',function(req,res){//SIGNIN User
    console.log("MESSAGE- Username: "+req.body.username+" Userpass: "+ req.body.userpass);
    modelUser.findOne({username: req.body.username}, function (err, user) {
        if(err) res.status(500).json(err);
        console.log("DATABASE- Username: "+user.username+" Userpass: "+ user.userpass+ " User "+ user);
        if(req.body.username == user.username){
            if (req.body.userpass != user.userpass) {
                res.status(401).json({message: "Userpass Wrong!"});
            } else {
                res.status(200).json({
                    user: user,
                    token: jwt.encode({
                        iss:user.username,
                        exp: moment().add(TOKEN_EXPIRATION,'minutes').valueOf()
                    }, app.get('jwtTokenSecret'))
                });
            }
        }else res.status(404).json({message:"User not found in our database"});
    })
});//SIGNIN User

//DELETE---------------------
router.delete('/:username', function(req,res){//Dar de baja a un usuario (DELETE User)
    try{
        var decoded = jwt.decode(req.body.token, app.get('jwtTokenSecret'));
        console.log(" Token decoded :" + decoded.iss + "\n Username: "+req.params.username+ "\n Date Token: "+decoded.exp+ "\n Date Now(): "+Date.now());
        if(decoded.exp>=Date.now()) {
            if (decoded.iss == req.params.username) {
                modelUser.findOne({username: req.params.username}, function (err, user) {
                    if (err) res.status(500).json(err);
                    if (user == null) res.status(404).json({message: "User not found in our database"});
                    else if (req.params.username == user.username) {
                        console.log("DATABASE- Username: " + user.username + " Userpass: " + user.userpass + " User " + user);
                        if (req.body.userpass == user.userpass) {
                            modelUser.remove({username: req.params.username}, function (err) {
                                if (err) res.status(500).json(err);
                                else res.status(200).json({messageDelete: 'Success!'});
                            })
                        } else res.status(401).json({messageDelete: "Userpass Wrong!"});
                    }
                })
            } else res.status(401).json({messageDelete: "Unauthoritzed, this token isn't this session"});
        } else res.status(401).json({messageDelete: "Unauthoritzed,token is old"});
    }catch(err){
        res.status(401).json({err: err, messageDelete: "Unauthoritzed"});
    }

});//Dar de baja a un usuario (DELETE User)


module.exports = router;
