const mongoose = require('mongoose'); //SCHEMA BASED APPROACH TO MODEL APP
const bcrypt = require('bcrypt'); //  TO ENSURE SECURITY WHEN SAVING OR HANDLING PASSWORDS
const saltRounds = 10;  // KINDA LIKE COST FACTOR, HIGHER THE SALT FACTOR, MORE DIFFICULT TO BRUTEFORCE
const {UserSchema,ListSchema,ItemSchema,SavedListSchema,SavedUserSchema} =require('../models/sevenModels');// IMPORT ALL SCHEMAS FOR THIS
const {ObjectId} = require('mongodb'); //WHEN STORING A FOREIGNKEY REFERECE KINDA THING


const User = mongoose.model('users',UserSchema);
const List = mongoose.model('list',ListSchema);
const Item = mongoose.model('item',ItemSchema);
const SavedUser = mongoose.model('saveduser',SavedUserSchema);
const SavedList = mongoose.model('savedlist',SavedListSchema);

function checkIfUsernameTaken(username) {
    User.findOne({username:username},(err,user)=>{
        if(err){
            return true;
        }
        if(user){
            return true;
        }
        else{
            return false;
        }
    });
}

function checkIfListExists(category,list_name,created_by){
    try {
        // A USER CANNOT HAVE TWO LISTS IN THE SAME CATEGORY WITH THE SAME NAME
        List.findOne({list_name:list_name,created_by:created_by,category:category},(err,list)=>{
            if(err){
                return true;
            }
            if(list){
                return true;
            }
            else{
                return false;
            }
        });  
    } catch (error) {
        return true;
    }
    
}



const addNewUser=(req,response)=>{
    try {
    //TO SIGNUP A USER
    let username=req.body.username.trim();
    let email=req.body.email.trim();
    let password=bcrypt.hashSync(req.body.password.trim(), saltRounds);
    User.findOne({
        $or:[
            {email:email},
            {username:username}
        ]
        }
        ,(err,user)=>{
        if(err){
            return response.render('layout', {
                template: 'signup',
                error:err.array()
                }); 
        }
        if(user){
            return response.render('layout', {
                template: 'signup',
                errors:"User already exists!"
                });
        }
        else{
            let newUser = new User({username:username,email:email,password:password});
            console.log(newUser);
            newUser.save((err,user)=>{
                if(err){
                    return response.render('layout', {
                        template: 'signup',
                        errors:"An error occurred sorry, try again"
                        });
                }
                req.session.username=username;
                response.redirect('/');
            })
        }
    });
    
    } catch (error) {
        console.log(error);
        response.render('/settings');
    }
   
}

const loginUser = (req,response)=>{
    try {
    let email=req.body.email.trim();
    let password=req.body.password.trim();
    User.findOne({email:email},(err,user)=>{
        if(user){
            if(bcrypt.compareSync(password, user.password)){
                req.session.username=user.username;
                req.session.email=user.email;
                response.locals.username=user.username;
                response.locals.email=user.email;
                response.redirect('/');
            }
            else{
                return response.render('layout', {
                    template: 'login',
                    errors:"Username and password dont match."
                    });
            }
        }
        if(err){
            return response.render('layout', {
                template: 'login',
                errors:err
                });
        }
        else{
            return response.render('layout', {
                template: 'login',
                errors:['No user found with this email address']
                });
        }
    });
    } catch (error) {
        console.log(error);
        return response.render('layout', {
            template: 'login',
            errors:['Internal server error. Please try again later']
            });
    }
}

const getDetails = (request,response,message=null)=>{
    try {
        //GET DETAILS TO FILL A USERS settings PAGE  
        if(!request.session.username){
          response.redirect('/');
        }
        else{
            User.findOne({username:request.session.username},(err,user)=>{
                if(user){
                    return response.render('layout', {
                        template: 'settings',
                        username:user.username,
                        email:user.email,
                        colour:user.colour,
                        errors:message
                        });
                    }
                if(err){
                    console.log(err);
                    return response.render('layout', {
                        template: 'settings',
                        username:user.username,
                        email:user.email,
                        colour:user.colour,
                        errors:[err]
                        });
                }
            });
        }
      
      } catch (err) {  
        return next(err);
      }
}

const updateUserDetails = (request,response)=>{
    try {
      User.findOne({email:request.body.email.trim()},(err,user)=>{
          if(err){
              //when there is an error
              getDetails(request,response,["Error occurred its not you its me"]);
          }
          if(user){
              console.log("password",request.body.newPassword,user.password);
              //found a user with that email
              //change details
              if(request.body.newPassword==''){
                // dont have to update password
                if(checkIfUsernameTaken(request.body.username.trim()) && user.username!=request.body.username){
                    getDetails(request,response,["This username is taken"]);
                }
                else{
                   
                    User.findOneAndUpdate({email:user.email},
                        {$set: {username:request.body.username.trim(),
                            colour:request.body.colour.trim()}},{new:true,useFindAndModify:false},(err,contact)=>{
                        if(err){
                            getDetails(request,response,["An error has occurred try again."]);
                        }
                        response.locals.successMessage="Updated";
                        getDetails(request,response);
                    });
                }
                
              }else{
                console.log("password",request.body.newPassword,user.password);
                //have to update password
                if(bcrypt.compareSync(request.body.oldPassword.trim(), user.password)){
                    //passwords match so allowed to change password
                    if(checkIfUsernameTaken(request.body.username.trim())   && user.username!=request.body.username.trim()  ){
                        getDetails(request,response,"Username already taken");
                    }
                    else{
                        User.findOneAndUpdate({email:user.email},{$set:{username:request.body.username.trim(),password:bcrypt.hashSync(request.body.newPassword.trim(), saltRounds),colour:request.body.colour.trim()}},{new:true,useFindAndModify:false},(err,contact)=>{
                            if(err){
                                getDetails(request,response,"Error occurred its not you its me");
                            }
                            request.session.username=user.username;
                            response.locals.successMessage="Updated";
                            getDetails(request,response);
                        });
                    }
                    
                }else{
                    //passwords dont match not allowed to change password edit failed
                    getDetails(request,response,"Old password doesnot match with one in database");
                }

              }
              
          }
      })
    } catch (error) {
        console.log(error);
        getDetails(request,response,["Server Error, sorry :("])
    }
};

const addList = (request,response) =>{
try {
    let category=request.body.category.trim();
    let newListName = request.body.newListName.trim();
    let newListDescription = request.body.newListDescription.trim();
    let currentuser = request.session.email;

    if(!checkIfListExists(category,newListName,currentuser)){
        //ADD A LIST ONLY IF IT HAS A UNIQUE(CATEGORY AND LIST NAME)
        let newList = List({category:category,created_by:currentuser,list_name:newListName,list_description:newListDescription});
        newList.save((err,list)=>{
        if(err){
            getAllListProfile(request,response,["Server error try again later please :("]);
        }
        if(list){
            //add items
            for (let index = 0; index < 7; index++) {
                let newItem = Item({list_id:list._id.toString(),item_order:index,item_name:request.body.item[index].trim(),item_description:request.body.description[index].trim()});
                newItem.save((err,item)=>{
                    if(err){
                        console.log(err);
                    }
                    
                }); 
                
            }
            console.log("newItem");
            getAllListProfile(request,response,["New list added :)"]);
        }
        });
    }    
    

    else{
        //list with this name exists
        
        getAllListProfile(request,response,["List with this name exists try again later"]);
    }
    
} catch (error) {
    console.log(error);
    getAllListProfile(request,response,["Server error try again later please :("]);
}
}

const getAllListProfile = (request,response,message=null)=>{
    try {
        //GET ALL LISTS CREATED BY A USER
    const useremail=request.session.email;
    List.find({created_by:useremail},(err,lists)=>{
        if(err){
            console.log(err);
            return response.render('layout', {
                template: 'profile',
                
            });
        }
        else{
            const list_id_from_list=[];
            lists.forEach(entry=>{
                console.log("List ids found : ",entry.get('_id'));
                list_id_from_list.push(entry.get('_id').toString());
                });

            Item.find({list_id:{$in: list_id_from_list}},(error,items)=>{
                if(error){
                    console.log(err);
                    return response.render('layout', {template: 'search'}); 
                }
                 else{
                    
                    return response.render('layout', {
                        template: 'profile',
                        myLists:lists,
                        items:items,
                        errors:message
                    });
                }
           }).sort({item_order:1});
           //SORT BY ORDER OF ITEMS
        }
        });
    } catch (error) {
        console.log(error);
        response.redirect('/')
    }
                
}
const updateList = (request,response) =>{
    try {
        list = request.body.item;
        description = request.body.description;
        console.log(description,list);
        for (const row in list) {
        Item.findByIdAndUpdate({_id:row},{$set:{  item_name : list[row].trim(), item_description : description[row].trim()}},{new:true,useFindAndModify:false},(err,item)=>{
            if(err){
                console.log(err);
                response.redirect('/profile');
            }
            
        });
        
    }
    response.locals.successMessage="Updated List!!";
    response.redirect('/profile');
    } catch (error) {
        console.log(error);
        response.locals.errors="Error updating list"
        response.redirect('/profile');
    }
}
const deleteList = (request,response)=>{
    try {
        listDel=request.body.listid.trim();
        List.findByIdAndDelete({_id:listDel},(err,doc)=>{
            if(err){
                console.log(err);
                response.redirect('/profile');
            }
            else{
                Item.deleteMany({list_id:doc._id.toString()},(err)=>{
                    if(err){
                        console.log(err);
                        response.redirect('/profile');

                    }
                    else{
                        response.locals.successMessage="Deleted List!!";
                        response.redirect('/profile');
                    }
                });
                
            }  
    });
    } catch (error) {
        console.log(err);
        response.locals.errors="Error deleting list"
        response.redirect('/profile');
    }
    

}

const search = (request,response)=>{
    try {
        query = request.body.search.trim();
        //option 'i' means case insensitive search
        User.find({email:{$regex: '.*' + query + '.*', $options: 'i'}},(err,users)=>{
            if(err){
                console.log(err);
                return response.render('layout', {
                template: 'search',
                });
            }
            else{
                //Find items that match query, find lists that those items belonged to , find lists that match the query
                Item.find({item_name:{$regex: '.*' + query + '.*', $options: 'i'}}
                         
                ,(err,items)=>{
                    if(err){
                        console.log(err);
                        return response.render('layout', {
                        template: 'search',
                        });
                    }
                    else{
                        const listids=[];
                        items.forEach(item => {
                            console.log("items found ",item);
                            listids.push(item.get('list_id'));
                        });
                        List.find({
                        $or:[
                            {list_name:{$regex: '.*' + query + '.*', $options: 'i'}},
                            {list_description:{$regex: '.*' + query + '.*', $options: 'i'}},
                            {category:{$regex: '.*' + query + '.*', $options: 'i'}},
                            {_id:{$in: listids}}
                        ]
                        },(err,lists)=>{
                            if(err){
                                console.log(err);
                                return response.render('layout', {
                                    template: 'search',
                                    });
                            }
                            else{
                                const list_id_from_list=[];
                                lists.forEach(entry=>{
                                    console.log("List ids found : ",entry.get('_id'));
                                    list_id_from_list.push(entry.get('_id').toString());
                                });

                                Item.find(
                                        {list_id:{$in: list_id_from_list}}
                                    ,(error,more_items)=>{
                                    if(error){
                                        console.log(err);
                                        return response.render('layout', {
                                            template: 'search',
                                            }); 
                                    }
                                    else{
                                        
                                        return response.render('layout', {
                                            template: 'search',
                                            users:users,
                                            lists:lists,
                                            items:more_items
                                            });
                                    }
                                });
                                
                            }
                            
                        });
                    }
                    
                });
            }
        });
    } catch (error) {
        console.log(error);
        return response.render('layout', {
            template: 'search',
            });
    }
    

}

const getUserPosts = (request,response)=>{
    try {
    const user=request.params.username.trim();
    //TO FIND THE USER'S EMAIL ADDRESS
    User.findOne({$or:[{username:user},{email:user}]},(err,founduser)=>{
        if(err){
            console.log(err);
        }
        else{
            if(founduser){
                List.find({created_by:founduser.email},(err,lists)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        const list_id_from_list=[];
                        lists.forEach(entry=>{
                            console.log("List ids found : ",entry.get('_id'));
                            list_id_from_list.push(entry.get('_id').toString());
                            });
            
                        Item.find({list_id:{$in: list_id_from_list}},(error,items)=>{
                            if(error){
                                console.log(err);
                                response.redirect('/search'); 
                            }
                             else{
                                return response.render('layout', {
                                    template: 'getAllUserPosts',
                                    myLists:lists,
                                    items:items,
                                    user:founduser
                                });
                            }
                       }).sort({item_order:1});
                    }
                }).sort({_id:-1});
            }
            else{
                response.redirect('/search')
            }
            
        }
    });
    } catch (error) {
        console.log(error);
        response.redirect('/search')
    }
    

                
}

const saveUser = (request,response)=>{
    try {
        User.findOne({username:request.body.username.trim()},(err,founduser)=>{
            if(err){
                console.log(err);
            }
            else{
                console.log(founduser.get('email'));
                let newEntry=SavedUser({useremail:founduser.get('email'),saved_by:request.session.email});
                newEntry.save((err,saved)=>{
                    if(err){console.log(err);}
                    else
                    {
                        console.log("saved",saved);
                        response.redirect('/search');
                }
                })
            }});
    } catch (error) {
        console.log(error);
        response.redirect('/search');
    }
};

const saveList = (request,response)=>{
try {
    User.findOne({username:request.session.username.trim()},(err,founduser)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log(founduser.get('email'));
            let newListEntry= SavedList({
                list_id:ObjectId(request.body.listid.trim()),
                saved_by:request.session.email});
            newListEntry.save((err,list)=>{
                if(err){console.log(err)}
                else{
                        console.log("saved",list);
                        response.redirect('/search');
                    }
                
            });
        }
    }); 
} catch (error) {
    console.log("Error: ", error);
    response.redirect('/');
}
};  

const unsaveuser = (request,response)=>{
    try {
        SavedUser.findOneAndDelete({useremail:request.body.unsaveid.trim(),saved_by:request.session.email},(err,unsaved)=>{
            if(err){
                console.log(err);
            }
            else{
                response.redirect('/');
            }
        })
    } catch (error) {
        console.log("Error: ", error);

        response.redirect('/');
    }
};


const unsavelist = (request,response)=>{
    try {
        SavedList.findOneAndDelete({list_id:ObjectId(request.body.unsaveid.trim()),saved_by:request.session.email},(err,unsaved)=>{
            if(err){
                console.log(err);
            }
            else{
                response.redirect('/');
            }
        }) 
    } catch (error) {
        console.log("Error: ", error);

        response.redirect('/');
    }
};

const getSavedStuff = (request,response)=>{
    currentuser=request.session.email;
    //get the users this current user saved and the lists too
    SavedUser.find({saved_by:currentuser},(err,saved)=>{
        if(err){
            console.log(err);
        }
        else{
            const savedusers=[];
            saved.forEach(user=>{
                savedusers.push(user.get('useremail'))
            });

            SavedList.find({saved_by:currentuser},(err,savedList)=>{
                if(err){ console.log(err);}
                else{
                    const listsThatUserSaved = [];
                    //get the lists saved by the user
                    savedList.forEach(eachList=>{
                        listsThatUserSaved.push(eachList.get('list_id'));
                    });
                    console.log("Users saved", savedusers,"lists saved: ",listsThatUserSaved);
                    //got the users now get the list created by these users and the lists saved already
                List.find({
                    $or:[
                        {created_by: {$in:savedusers}},
                        {_id :{$in:listsThatUserSaved}}
                    ]
                },(err,lists)=>{
                    if(err){
                    console.log(err);
                    }
                    else{
                        const list_id_from_list=[];
                        lists.forEach(entry=>{
                            console.log("List ids found : ",entry.get('_id'));
                            list_id_from_list.push(entry.get('_id').toString());
                        });

                        Item.find(
                                {list_id:{$in: list_id_from_list}}
                            ,(error,items)=>{
                            if(error){
                                console.log(err);
                                
                            }
                            else{
                            
                                return response.render('layout', {
                                    template: 'index',
                                    lists:lists,
                                    items:items,
                                    savedusers:savedusers,
                                    listsThatUserSaved:listsThatUserSaved
                                    });
                            }
                        });
                      
                    }
            }).sort({_id:-1});
                }
            });

            
        }
    });

};

const getTrending = (request,response)=>{
    try {
        SavedUser.find({},(err,saved)=>{
            if(err){
                console.log(err);
                response.redirect('/');
            }
            else{
                const savedusers=[];
                saved.forEach(user=>{
                    savedusers.push(user.get('useremail'))
                });
    
                SavedList.find({},(err,savedList)=>{
                    if(err){ console.log(err);}
                    else{
                        const listsThatUserSaved = [];
                        //get the lists saved by the user
                        savedList.forEach(eachList=>{
                            listsThatUserSaved.push(eachList.get('list_id'));
                        });
                       
                        //got the users now get the list created by these users and the lists saved already
                    List.find({
                        $or:[
                            {created_by: {$in:savedusers}},
                            {_id :{$in:listsThatUserSaved}}
                        ]
                    },(err,lists)=>{
                        if(err){
                        console.log(err);
                        }
                        else{
                            const list_id_from_list=[];
                            lists.forEach(entry=>{
                                
                                list_id_from_list.push(entry.get('_id').toString());
                            });
    
                            Item.find(
                                    {list_id:{$in: list_id_from_list}}
                                ,(error,items)=>{
                                if(error){
                                    console.log(err);
                                    
                                }
                                else{
                                
                                    return response.render('layout', {
                                        template: 'trending',
                                        
                                        lists:lists,
                                        items:items,
                                        savedusers:savedusers,
                                        listsThatUserSaved:listsThatUserSaved
                                        });
                                }
                            });
                          
                        }
                }).sort({_id:-1});
                    }
                });
    
                
            }
        }); 
    } catch (error) {
        console.log("Error: ", error);

        response.redirect('/');
    }
};

module.exports={addNewUser,loginUser,getDetails,updateUserDetails,addList,getAllListProfile,updateList,deleteList,search,getUserPosts,saveUser,getSavedStuff,saveList,unsavelist,unsaveuser,getTrending};
