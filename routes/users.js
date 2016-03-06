var express = require('express');
var router = express.Router();
var db = require('../private/database');

//Peticiones HTTP
//GET---------------------
router.get('/all', function(req,res,next){
   var message= {
     Users: db.getAllUsers()
   };
  console.log(message);
  res.status(200).jsonp(message);
});
router.get('/', function(req,res,next){
  if(req.body.username) res.jsonp(db.getUser(req.body.username));
  else res.status(500).json({message: 'username vacio'});
});
//POST---------------------
router.post('/',function(req,res,next){
  if(req.body.username=="" || req.body.userpass=="")  res.jsonp({message:"Hay campos obligaotrios vacios"});
  else res.status(200).jsonp(db.createUser(req.body.username,req.body.userpass));
});
//PUT-----------------------
router.put('/', function(req,res,next){
  res.jsonp(db.modifyUser(req.body.username,req.body.userpass,req.body.xbeepan));
});
router.put('/signin',function(req,res,next){
  res.jsonp(db.SignIn(req.body.username, req.body.userpass));
});
//DELETE---------------------

module.exports = router;
