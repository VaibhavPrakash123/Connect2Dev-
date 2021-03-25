const express = require('express');
const router = express.Router();
const auth  = require('../middleware/auth');
const User = require('../models/user');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');


//Securing the route using Auth Middleware
router.get('/',auth, async(req,res)=>{

    try{
        //fetch user from auth middleware 
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);

    }catch(err)
    {
        
        res.status(500).send('Server Error');
    }
    res.send("Auth route");
});


//User verification
router.post('/',[
    check('email', 'Please provide valid email').not().isEmail(),
    check('password', 'please enter the password').exists()
],async(req,res)=>
{
    const{email,password} = req.body;

    try{

        let user = await User.findOne({email});
        if(!user)
        {
            return res
            .status(400)
            .json('Invalid Credentials');

        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch)
        {
            return res
            .status(400)
            .json('Invalid Credentials');

        }
        const payload = {
            user:{
                id: user.id
            }
        };

        const token = jwt.sign(payload, config.get('jwtSecret'), 
        {expiresIn: 360000});
        res.status(200).json({token: token});

    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');

    }
});


module.exports = router;