var mongoose = require('mongoose');
var express = require('express');
var modelUser = require('../models/users.js');
var modelXBee = require('../models/xbee.js');

//GET DATABASE----------------------

/*exports.getAllXBees = function(){
    console.log('GET All XBee');
    modelXBee.find(function(err,xbees){
        console.log(xbees);
        if(err) return err;
        return xbees;
    })
};//

/*function getUser(username){
    console.log('GET User');
    modelUser.find({username:username}, function(err,user){
        if (!err) {
            console.log('User: '+user);
            return user;
        } else return err;
    })
}*/

/*exports.getUser= function (username){
    console.log('GET User');
    modelUser.find({username:username}, function(err,user){
        if (!err) {
            console.log('User: '+user);
            return user;
        } else return err;
    })
};*/


/*exports.getXBee = function(mac){
    return getXBee(mac);
};
function getXBee (mac){
    console.log('GET XBee');
    modelXBee.find({mac: mac}, function(err,xbee){
        if(!err){
            console.log('XBee: '+xbee);
            return xbee;
        }else return err;

    })
}*/

/*exports.SignIn = function(username, userpass){
  if(getUser(username).userpass == userpass) return getUser(username);
    else return {message: 'User not valid'};
};*/

//CREATE DATABASE----------------------
/*exports.createUser = function(username,password){
    if(getUser(username)) return json({message: 'Exist User'});
    else{
        modelUser.create({username: username, userpass: password},function(err,user){
            if(err) return err;
            return user;
        });

    }
};*/

/*exports.createXBee = function(mac, owner){
    if(getXBee(mac)) return json({ message: 'Exist XBee'});
    else{
        modelXBee.create({mac: mac, owner: owner},function(err,xbee){
            if(err) return err;
            return xbee;
        });

    }
};*/

//DELETE DATABASE--------------------------
/*exports.deleteUser = function (username, userpass){
    if(getUser(username).userpass==userpass){
        modelUser.remove({username: username}, function(err){
            if(err) return err;
            else return {message: 'Success!'};
        })
    }
};*/
/*exports.deleteXBee = function (username, userpass, mac){
    if(getXBee(mac).owner==username){
        if(getUser(username).userpass==userpass){
            modelXBee.remove({mac: mac}, function(err){
                if(err) return err;
                else return {message: 'Success!'};
            })
        }else return {message: "You aren't owner this XBee"};
    }
};*/

//MODIFY DATABASE-------------------------
/*exports.modifyUser = function(username, password,xbeepan){
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
};*/
exports.modifyXBee = function(mac, owner,xbeenet){
    if(owner!="" && xbeenet!="") {
        modelXBee.update({mac: mac}, {$set: {owner: owner, xbeenet: xbeenet}}, function (err, xbee) {
            if (err) return err;
            return xbee;
        });
    }else  if(owner=="" && xbeenet!="") {
        modelXBee.update({mac: mac}, {$pushAll: {xbeenet: xbeenet}}, function (err, xbee) {
            if (err) return err;
            return xbee;
        });
    }else  if(owner!="" && xbeenet=="") {
        modelXBee.update({mac: mac}, {$set: {owner: owner}}, function (err, xbee) {
            if (err) return err;
            return xbee;
        });
    }
};

/*exports.addHistory = function(mac, history){
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
};*/

/*exports.addXBeeNe = function(mac, xbeenet){
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
};*/