const express = require('express');

const router = express.Router();

module.exports = params => {

    router.get('/', function (request, response, next){
        
        try {
            response.locals.username=null;
            response.locals.email=null;
            request.session.destroy();
            
            response.redirect('/');
        } catch (err) {
            
        return next(err);
        }
    });
 
return router;
};