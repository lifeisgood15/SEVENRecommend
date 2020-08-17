const express = require('express');
const {loginUser} = require('../controllers/sevenControllers');


const { check, validationResult } = require('express-validator');

const router = express.Router();

const validations = [
  
  check('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('A valid email address is required'),
  check('password')
    .trim()
    .isLength({ min: 3 })
    .escape()
    .withMessage('Password is required'),
  
];

module.exports = params => {

    router.get('/', function (request, response, next){
        
        try {
          if(request.session.username){
            response.redirect('index');
          }
          else{
            return response.render('layout', {
              template: 'login',
              });
          }
        
        } catch (err) {
            
        return next(err);
        }
    });
  router.post('/',validations, function (request, response, next){
        
    try {
      const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.render('layout', {
        template: 'login',
        errors:errors.array()
        });
    }
    else{
      loginUser(request,response);
    }
  
  } catch (err) {
        
    return next(err);
    }
});
return router;
};