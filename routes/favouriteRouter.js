const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
const User = require('../models/users');
const Dishes = require('../models/dishes');

const Favourites = require('../models/favourites');
const favouriteRouter = express.Router();

var authenticate = require('../authenticate');

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
///working endpoint
.get(cors.cors,authenticate.verifyUser, (req,res,next) => {
    Favourites.findOne({'user' : req.user._id})
    .populate({path: 'user', model: User})
    .populate({path: 'dishes', model: Dishes})
    .then((favourites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
///working endpoint
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({'user' : req.user._id})
    .then((favourite) => {
    if (favourite != null){
         for  (var i =(req.body.length -1); i>=0; i-- )
               if(favourite.dishes.indexOf(req.body[i]._id) === -1)
                favourite.dishes.push(req.body[i]._id);
         favourite.save()                              
            .then((favourite) => {
                Favourites.findById(favourite._id)
                .populate('user')
                .populate('dishes')
                .then((favourite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                },(err) => next(err))  
                .catch((err) => next (err));
            },(err) => next(err))
            .catch((err) =>  next (err)); 
    }else {
        Favourites.create({'user': req.user._id})
        .then((favourite) => {           
            for (var i = (req.body.length -1); i >= 0; i--) {
                favourite.dishes.push(req.body[i]._id);
                favourite.user = req.user._id;
            }
                favourite.save()                                           
                    .then((favourite) => {
                        Favourites.findById(favourite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favourite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourite);
                        } ,(err) => next(err))
                        .catch((err) => next(err));
                    },(err) => next(err))
                    .catch((err) => next(err));                                          
        },(err) => next(err))
        .catch((err) => next(err));
        }
    }, (err) => next(err) )
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites');
})

///working endpoint
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
///working endpoint
.get(cors.cors,  authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({'user': req.user._id})
    .then((favourites) => {
        if(!favourites){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists":false, "favourites": favourites});
        }
        else{
            if(favourites.dishes.indexOf(req.params.dishId) <0){
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists":false, "favourites": favourites});
            }            
        
        else{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists":true, "favourites": favourites});
        }
    }
    }, (err) => next(err))
    .catch((err) => next(err))
})
///working endpoint
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({'user': req.user._id})
    .then((favourite) => {
        if (favourite != null) {
            if (favourite.dishes.indexOf(req.params.dishId) > -1) {
                err = new Error('Favourite dish ' + req.params.dishId + ' already exists');
                err.status = 403;
                return next(err); 
            } else {
                favourite.dishes.push({'_id': req.params.dishId});
                favourite.save()
                .then((favourite) => {
                    Favourites.findById(favourite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favourite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite); 
                    })
                })
                .catch((err) => {
                    return next (err);
                });
            }
        } else {
            Favourites.create({'user': req.user._id})
            .then((favourite) => {
                favourite.dishes.push({'_id': req.params.dishId});
                favourite.save()
                .then((favourite) => {
                    Favourites.findById(favourite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favourite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite);
                        }, (err) => next(err))
                        .catch((err) => next (err));

                     }, (err) => next(err))               
                     .catch((err) => next (err));
                }, (err) => next(err))
            .catch((err) => next(err));
            }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({'user' : req.user._id})
    .then((favourite) => {
        if (favourite == null) {
            err = new Error('Favourite dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        } else {
            if (favourite.dishes.indexOf(req.params.dishId) === -1) {
                err = new Error('Favourite dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
            favourite.dishes.pull({'_id': req.params.dishId});
            favourite.save()
            .then((resp) => {
                console.log('Favorite Dish Deleted!', resp);
                Favourites.findOne({'user' : req.user._id})
                .populate({path: 'user', model: User})
                .populate({path: 'dishes', model: Dishes})
                .then((favourite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                }, (err) => next(err))
                .catch((err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
        }, (err) => next(err))
        .catch((err) => next(err))});
module.exports = favouriteRouter;