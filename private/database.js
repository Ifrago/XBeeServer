var mongoose = require('mongoose');
var express = require('express');
var router =  express.Router();
var modelUser = require('../models/users.js');
var modelXBee = require('../models/xbee.js');

//Peticiones HTTP
//HTTP:GET---------------------
router.get('/', function(req, res, next){
    var message = {
        XBee: getAllXBees(),
        Users: getAllUsers()
    };
    console.log(message);
    res.status(200).jsonp(message);
});
router.get('/myxbee', function(req, res, next){
    res.status(200).jsonp(message);
});
router.get('/myuser', function(req, res, next){
    res.status(200).jsonp(message);
});
//HTTP: PUT--------------------
router.put('/login', function(req, res, next){//mirar de hacer tokens
    res.status(200).jsonp(message);
});
//HTTP:DELETE------------------
router.delete('/myuser', function(req, res, next){
    res.status(200).jsonp(message);
});
router.delete('/myxbee', function(req, res, next){
    res.status(200).jsonp(message);
});

//GET DATABASE----------------------
function getAllUsers(){
    console.log('GET All User');
    modelUser.find(function(err,users){
        console.log(users);
        return users;
    })
};

function getAllXBees (){
    console.log('GET All XBee');
    modelXBee.find(function(err,xbees){
        console.log(xbees);
        return xbees;
    })
};
function getUser(username){
    console.log('GET User');
    modelUser.find({username:username}, function(err,user){
        console.log('User: '+user);
        return user;
    })
};
function getXbee(mac){
    console.log('GET XBee');
    modelXBee.find({mac: mac}, function(err,xbee){
        console.log('XBee: '+xbee);
        return xbee;
    })
};

//CREATE DATABASE----------------------
function createUser(username,password){
    if(getUser(username)) return json({message: 'Exist User'});
    else{
        modelUser.create({username: username, userpass: password},function(err){
            if(err) return err;
        });
        return user;
    }
};

function createXBee(mac, owner){
    if(getXbee(mac)) return json({ message: 'Exist XBee'});
    else{
        modelXBee.create({mac: mac, owner: owner},function(err){
            if(err) return err;
        });
        return xbee;
    }
};

//MODIFY DATABASE-------------------------
function modifyUser(username, password,xbeepan){
    if(password!="" && xbeepan!="") {
        modelUser.update({username: username}, {$set: {userpass: password, xbeepan: xbeepan}}, function (err, user) {
            if (err) return err;
            return user;
        });
    }else if(password=="" && xbeepan!="") {
        modelUser.update({username: username}, {$set: {xbeepan: xbeepan}}, function (err, user) {
            if (err) return err;
            return user;
        });
    }else if(password!="" && xbeepan=="") {
        modelUser.update({username: username}, {$set: {userpass: password}}, function (err, user) {
            if (err) return err;
            return user;
        });
    }
}
function modifyXBee(mac, owner,xbeenet){
    if(owner!="" && xbeenet!="") {
        modelXBee.update({mac: mac}, {$set: {owner: owner, xbeenet: xbeenet}}, function (err, xbee) {
            if (err) return err;
            return xbee;
        });
    }else  if(owner=="" && xbeenet!="") {
        modelXBeer.update({mac: mac}, {$pushAll: {xbeenet: xbeenet}}, function (err, xbee) {
            if (err) return err;
            return xbee;
        });
    }else  if(owner!="" && xbeenet=="") {
        modelXBee.update({mac: mac}, {$set: {owner: owner}}, function (err, xbee) {
            if (err) return err;
            return xbee;
        });
    }
}

function addHistory(mac, history){
    if(getXBee(mac).history){
        modelXBee.update({mac:mac},{$pushAll:{history:history}}, function (err,xbee){
            if(err) return err;
            return xbee;
        });
    }else{
        modelXBee.update({mac: mac}, {$set: {history: history}}, function (err,xbee) {
            if (err) return err;
            return xbee;
        });
    }
}

function addXBeeNet(mac, xbeenet){
    if(getXBee(mac).xbeenet){
        modelXBee.update({mac:mac},{$pushAll:{xbeenet:xbeenet}}, function (err,xbee){
            if(err) return err;
            return xbee;
        });
    }else{
        modelXBee.update({mac: mac}, {$set: {xbeenet: xbeenet}}, function (err,xbee) {
            if (err) return err;
            return xbee;
        });
    }
}

module.exports = router;