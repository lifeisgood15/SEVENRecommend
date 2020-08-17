const express = require('express');
const { getTrending } = require('../controllers/sevenControllers');

const router = express.Router();

module.exports = params => {

    router.get('/', function (request, response, next){
        
        try {
            response.locals.username=request.session.username;
            getTrending(request,response);
        
        } catch (err) {
            
        return next(err);
        }
    });
 
return router;
};