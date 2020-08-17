const express = require('express');
const router = express.Router();

const loginRoute = require('./login');
const trendingRoute = require('./trending');
const profileRoute = require('./profile');
const settingsRoute = require('./settings');
const signUpRoute = require('./signup');
const logoutRoute = require('./logout');
const searchRoute= require('./search');
const saveRoute = require('./save');
const { getSavedStuff } = require('../controllers/sevenControllers');

module.exports = params => {
    router.get('/', function (request, response, next){
        
        try {
            response.locals.username=request.session.username;
            if(request.session.username){
                getSavedStuff(request,response);
            }else{
                response.redirect('/trending');
            }
        
        } catch (err) {
            
        return next(err);
        }
    });
    router.use('/login', loginRoute());
    router.use('/trending', trendingRoute());
    router.use('/profile',profileRoute());
    router.use('/settings',settingsRoute());
    router.use('/signup',signUpRoute());
    router.use('/logout',logoutRoute());
    router.use('/search',searchRoute());
    router.use('/save',saveRoute());

 return router;
};