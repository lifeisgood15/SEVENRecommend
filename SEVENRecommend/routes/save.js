const express = require('express');
const { saveUser, saveList , unsavelist, unsaveuser} = require('../controllers/sevenControllers');

const router = express.Router();

module.exports = params => {

    router.post('/user', function (request, response, next){
        
        try {
            if(request.session.username){
              //if user is logged in
              saveUser(request,response);
    
            }
            else{
              //go to login page
              response.redirect('/login');
            } 
          } catch (error) {
            return next(error);
          }
    });
    router.post('/list', function (request, response, next){
        
        try {
            if(request.session.username){
              //if user is logged in
              saveList(request,response);
    
            }
            else{
              //go to login page
              response.redirect('/login');
            } 
          } catch (error) {
            return next(error);
          }
    });

    router.post('/unsave/list', function (request, response, next){
        
      try {
          if(request.session.username){
            //if user is logged in
            unsavelist(request,response);
  
          }
          else{
            //go to login page
            response.redirect('/login');
          } 
        } catch (error) {
          return next(error);
        }
  });

  router.post('/unsave/user', function (request, response, next){
        
    try {
        if(request.session.username){
          //if user is logged in
          unsaveuser(request,response);

        }
        else{
          //go to login page
          response.redirect('/login');
        } 
      } catch (error) {
        return next(error);
      }
});
 
return router;
};