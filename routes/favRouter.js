const express = require('express');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

var Favourites = require('../models/favourites');git 

const favouriteRouter = express.Router();
favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser, (req,res,next) => {
    Favourites.findOne({ user : req.user._id})
    .populate('user')
    .populate('dishes')
    .exec((err, favourites) =>{
        if (err) return next(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourites);
    });
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({'user' : req.user._id}, (err, favourite))
    if (err) return next
    
    if (!favourite){
        Favourites.create({ user: req.user._id })
        .then((favourite) => {
            for (i = 0; i < req.body.length; i++)
                if (favourite.dishes.indexOf(req.body[i]._id) < 0)
                    favourite.dishes.push(req.body[i]);
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
                return next(err);
            });
        })
        .catch((err) => {
            return next(err);
        })
    }
    else{
        for (i = 0; i < req.body.length; i++)
            if (favourite.dishes.indexOf(req.body[i]._id)<0)
                favourite.dishes.push(req.body[i]);
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
            return next(err);
        });
    }

})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
                    res.setHeader('Content-Type', 'text/plain');
                    res.json('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOneAndRemove({ user: req.user._id}, (err, res))
        if(err) return next(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
});


favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors,  authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({'user': req.user._id})
    .then((favourites) => {
        if(!favourites){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists":false, "favourites": favourites});
        }
        else{
            if(favourites.dishes.indexOf(req.params.dishId) < 0){
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
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({'user': req.user._id}, (err, favourite))
        if (err) return next(err);

        if (!favourite){
        Favourites.create({ user: req.user._id })
        .then((favourite) => {
            favourite.dishes.push({"_id": req.params.dishId});
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
                return next(err);
            });
        })
        .catch((err) => {
            return next(err);
        })
    }
    else {
            if (favourite.dishes.indexOf(req.params.dishId) < 0)
                favourite.dishes.push({"id": req.params.dishId});
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
                    return next(err);
                })
            }
                else{
                    res.statusCode = 403;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('Dish ' + req.params.dishId + ' already' );
                }
            }
        )
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain');
        res.json('PUT operation not supported on /favourites/' + req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ user: req.user._id}, (err, favourite))
            if(err) return next(err);
            
            console.log(favourite);
        var index = favourite.dishes.indexOf(req.params.dishid)
        if (index >=0) {            
            favourite.dishes.splice(index,1);
            favourite.save()
             .then((favourite) => {
                Favourites.findById(favourite._id)
                .populate('user')
                .populate('dishes')
                .then((favourite) => {
                    console.log('Favourite dish deleted!', favourite )
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                })
             })
             .catch((err) => {
                return next(err);
                })
            }
            else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish ' + req.params.disId + ' not in your list')
            }            
            });
        
        module.exports = favoriteRouter;
    






















