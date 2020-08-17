const {addNewUser} = require('../controllers/sevenControllers');

const express = require('express');

const router = express.Router();

module.exports = params => {

    router.get('/', function (request, response, next){
        
        try {
        return response.render('layout', {
            template: 'signup',
            });
        } catch (err) {
            
        return next(err);
        }
    });

    router.post('/',async function (request, response, next){
        try {
            addNewUser(request,response);
            } catch (err) {
                
            return next(err);
            }
    });
 
return router;
};
