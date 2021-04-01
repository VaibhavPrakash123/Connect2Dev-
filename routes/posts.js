const express = require('express');
const router = express.Router();
const{check, validationResult} = require('express-validator');
const Post  = require('../models/post');
const User = require('../models/user');
const Profile = require('../models/profile');
const auth = require('../middleware/auth');
const c = require('config');

//@POST create new Post
router.post('/',[auth,
check('text', 'text is required').not().isEmpty()],
async (req,res)=>
{

    const err = validationResult(req);
    if(!err.isEmpty)
    {
        return res.status(400).json({errors : err.array()});
    }

    try {
        
        const user = await User.findById(req.user.id).select('-password');
        console.log("Hello");
        const newPost = new Post({
            text: req.body.text,   
            name: user.name,
            avatar: user.avatar,
            user: req.user.id,
        });
        console.log(user.name);
        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

//@GET posts
router.get('/',auth, 
async(req,res)=>
{   
    try {
        const posts = await Post.find().sort({date : -1});
        res.json(posts);
    } catch (err) {
        res.status(500).send("Server Error");
    }
   

});

//@GET post by id
router.get('/:post_id',auth,
async (req,res)=>
{
    try {
    
        const post = await Post.findById(req.params.post_id);
        if(!post){
            res.status(404).json({msg: "Post(s) not found"});
        }
        res.json(post);

    } catch (error) {
        console.error(error.message);
        if(error.kind === "ObjectId"){

            return res.status(404).json({msg: "Post(s) not found"});
        }
        return res.status(500).send('Server Error');
    }

    

})

//@DELETE posts
router.delete('/:id',auth,
async (req,res)=>
{
    try {
        
        const post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).json({msg:"Post Not found"});
        } 
        const user = post.user;

        //Check User Authorization for post deletion
        if(user.toString() !== req.user.id){
            res.status(401).json({msg: "User not Authorized"});
        }

        await post.remove();
        res.json({msg:"Post Deleted"});

    } catch (err) {
        console.log(err.message);
        if(err.kind==="ObjectId"){
          return res.status(404).json({msg:"Post Not found"});
        } 
        res.send("Server Error");
    }
})

//@PUT Add Likes to Post
router.put('/likes/:id',auth,
async(req,res)=>{

    try {
        
         
         const post = await Post.findById(req.params.id);
         if(post.likes.filter(like=> like.user.toString() === req.user.id).length > 0){
             return res.status(400).json({msg : "Post already liked"});
         }
         post.likes.unshift({user:req.user.id});

         await post.save();

         res.json(post.likes);

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
} )

//@PUT Unlike a Post
router.put('/unlikes/:id',auth,
async(req,res)=>{

    try {
        
         
         const post = await Post.findById(req.params.id);
         if(post.likes.filter(like=> like.user.toString() === req.user.id).length === 0){
             return res.status(400).json({msg : "Post has not yet been liked"});
         }
         const removeIndex = post.likes.
         map(like=>like.user.toString()).
         indexOf(req.user.id);
         
         post.likes.splice(removeIndex,1);

         await post.save();

         res.json(post.likes);

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
} )


//@POST comment on a Post
router.post('/comment/:post_id',[auth,
    check('text', 'text is required').not().isEmpty()],
    async (req,res)=>
    {
    
        const err = validationResult(req);
        if(!err.isEmpty)
        {
            return res.status(400).json({errors : err.array()});
        }
    
        try {
            
            const user = await User.findById(req.user.id).select('-password');
            const post  = await Post.findById(req.params.post_id);


            console.log("Hello");
            const newComment = {
                text: req.body.text,   
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            };
            post.comments.unshift(newComment);
            await post.save();
            res.json(post);
        } catch (err) {
            res.status(500).send("Server Error");
        }
    });


    //@Delete Comment on a Post
    router.delete('/comment/:post_id/:comment_id',
    auth,
    async (req,res)=>
    {

        const post = await Post.findById(req.params.post_id);
        const comment  = await post.comments.find(comment=>comment.id === req.params.comment_id);
        if(!comment){
            res.status(400).json({msg: "Comment does not Exist"});
        }

        
        if(comment.user.toString() !== req.user.id){
            res.status(401).json({msg: "User Not authorized"});
        }

        removeIndex = post.comments.map(comment=> comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex,1);
        res.json(post.comments);
    });
    
module.exports = router;