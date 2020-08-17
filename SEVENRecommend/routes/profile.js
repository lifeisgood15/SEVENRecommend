const express = require('express');

const { check, validationResult } = require('express-validator');
const { addList, getAllListProfile, updateList, deleteList, getUserPosts } = require('../controllers/sevenControllers');
const { request, response } = require('express');

const router = express.Router();

const validationsItem = [
  
    check('newListName')
        .trim()
        .isLength({ min: 3 },{max : 30})
        .escape()
        .withMessage('Minimum length 3 maximum 30'),
    check('newListDescription')
      .trim()
      .isLength({ min: 3 })
      .escape()
      .withMessage('List Description should be greater than 3 less than 200 letters'),
    
  ];



module.exports = params => {

    router.get('/', function (request, response, next){
        
        try {
          if(request.session.username){
          response.locals.username=request.session.username;
          getAllListProfile(request,response);
          }
          else{
            response.redirect('/');
          }
        } 
        catch (err) {
            
        return next(err);
        }
    });

    

    router.post('/',validationsItem, async function (request, response, next){
        
        try {
            const errors = validationResult(request);
          if (!errors.isEmpty()) {
            return response.render('layout', {
              template: 'profile',
              errors:errors.array()
              });
          }
          else{
            addList(request,response);
            
          }
        
        } catch (err) {
            
        return next(err);
        }
    });

    router.post('/edit',function(request,response,next){
      
      try {
        updateList(request,response);
      } catch (error) {
        return(next(error));
      }
      
    });
    router.post('/delete',function(request,response,next){
      try {
        deleteList(request,response);
      } catch (error) {
        return(next(error));
      }
      
    }); 
return router;
};