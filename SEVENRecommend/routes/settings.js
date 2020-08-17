const express = require('express');
const { check, validationResult } = require('express-validator');
const { getDetails,updateUserDetails } = require('../controllers/sevenControllers');

const router = express.Router();

const validationsSettings = [
  
    check('username')
        .trim()
        .isLength({ min: 3 },{max : 30})
        .escape()
        .withMessage('Minimum length 3 maximum 30')
    ];
module.exports = params => {

    router.get('/', function (request, response, next){
            try {
                response.locals.username=request.session.username;
                getDetails(request,response);
            } 
            catch (err) {
                    
                return next(err);
            }
        
    });


    router.post('/',validationsSettings, async function (request, response, next){
        
        try {
            response.locals.username=request.session.username;
            const errors = validationResult(request);
           
          if (!errors.isEmpty()) {
            return response.render('layout', {
              template: 'settings',
              errors:errors.array()
              });
          }
          else{
            //edit profile
            updateUserDetails(request,response);   
                  
          }
        
        } 
        catch (err) {   
            return next(err);
        }
    });
 
return router;
};