const express = require('express');
const { search,getUserPosts } = require('../controllers/sevenControllers');

const router = express.Router();

module.exports = params => {

    router.get('/', function (request, response, next){
        
        try {
            response.locals.username=request.session.username;
            response.locals.email=request.session.email;

        return response.render('layout', {
            template: 'trending',
            });
        } catch (err) {
            
        return next(err);
        }
    });
    router.post('/', function (request, response, next){
        
        try {
            response.locals.username=request.session.username;
            response.locals.email=request.session.email;


            search(request,response);
        } catch (err) {
            
        return next(err);
        }
    });

    router.get('/:username?', function (request, response, next){
        
        try {
            response.locals.username=request.session.username;
            response.locals.email=request.session.email;
            getUserPosts(request,response);
          
        } 
        catch (err) {
            
        return next(err);
        }
    });

    
 
return router;
};