const express = require('express');
const {check, validationResult}   = require('express-validator/check');
const router = express.Router();
const User = require('../models/user.js');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');


router.post('/',[
    check('name','Name is required').not().isEmpty(),
    check('email','Please provide valid email').isEmail(),
    check('password','Password should be more than 6 words').isLength({min:6})
],async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }
    //User Authentication 
    const {name, email, password} = req.body;
    try{
        let user = await User.findOne({email});
        //If user already exists
        if(user){
            res.status(400).json({errors: [{ msg : 'User already exists'}]});
        }

        //Retrieve gravtar for user
        let avatar = gravatar.url(email,{
            s:200,
            r:'pg',
            d:'mm'
        });

        user  = new User({
            name,
            email,
            avatar,
            password
        });
        //Encrypt Password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password,salt);
        await user.save();

        res.send('User Registered');
    }
    catch(err)
    {
        res.status(500).send("Server Error");
        console.log(err.message);
    }
});

module.exports = router;