const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');
const user = require('../models/user');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const request = require('Request');
const config = require('config');
const axios = require('axios');


//Get user profile
//@route    GET api/profile
//@desc     Get logged in User profile
//
router.get('/me', auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({ user: req.user.id }).
            populate(
                'user', ['name'
                , 'avatar']);
        if (!profile) {
            return res.status(400).json({ "msg": "No profile available for this user" });
        }
        res.json(profile);


    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error!");
    }


});

router.post('/', [auth, [
    check('skills', 'Skills are required').not().isEmpty()]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });

        }
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        //Create Profile object
        const profileFields = {}
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skills => skills.trim())

        };
        console.log(profileFields.skills);

        //profile Social websites
        profileFields.social = {};
        if (facebook) profileFields.social.facebook = facebook;
        if (twitter) profileFields.social.twitter = twitter;
        if (youtube) profileFields.social.youtube = youtube;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;

        try {
            let profile = Profile.findOne({ user: req.user.id });

            console.log("User Id ", req.user.id);
            if (!profile) {
                profile = await Profile.findOneAndUpdate({ user: req.user.id },
                    { $set: profileFields },
                    { new: true });

                console.log("Hello", profile);
                return res.json(profile);

            }

            profile = new Profile(profileFields);
            await profile.save();
            console.log("Hello", profile);
            res.json(profile);


        }
        catch (err) {
            res.status(500).send('Server Error');
            console.log(err.message);
        }




    }
)



//@GET all profiles with user's name with avatar
router.get('/', async (req, res) => {
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar']);
        res.json({ profile });
    } catch (err) {
        res.status(500).send('Server Error');
        console.error(err.message);
    }
})

//@DELETE profile and user with ID

router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id });
        console.log("User profile deleted");

        await user.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: "User Deleted" });
    }
    catch (err) {
        res.status(500).send("Server Error");
        console.error(err.message);
    }
})

//@GET  profile with user id 
router.get('/user/:userid', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.userid });
        if (!profile) {
            res.status(400).json({ "msg": "No profile available for this user" });
        }
        res.json(profile);
    }
    catch (err) {
        res.status(500).send('Server Error');
        console.log(err.message);
    }
})

//Add profile experience
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company name is required').not().isEmpty()]
], async (req, res) => {

    const error = validationResult(req);
    if (!error.isEmpty) {
        return res.status(500).send({ "errors": error.array() });
    }

    //Destructuring Data from request body
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const experienceFields = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    };


    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(experienceFields);

        await profile.save();
        res.json(profile);
    } catch (err) {
        res.status(500).send("Server Error");
    }



})

//@DELETE profile experience /api/profile/experience/:expid
router.delete('/experience/:expid', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //find experience of profile
        let removeIndex = profile.experience.
            map(item => item.id).
            indexOf(req.params.expid);
        console.log(removeIndex);
        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);


    }
    catch (err) {
        res.status(500).send("Server Error");
        console.log(err.message);
    }

})


//@PUT Update Profile Education
router.put('/education', [auth, [
    check('school', 'School Name is required').not().isEmpty(),
    check('degree', 'Degree name is required').not().isEmpty()]
], async (req, res) => {

    const error = validationResult(req);
    if (!error.isEmpty) {
        return res.status(500).send({ "errors": error.array() });
    }

    //Destructuring Data from request body
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    };


    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);

        await profile.save();
        console.log("Hello");
        res.json(profile);
    } catch (err) {
        res.status(500).send("Server Error");
    }



})

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //find experience of profile
        let removeIndex = profile.education.
            map(item => item.id).
            indexOf(req.params.expid);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);


    }
    catch (err) {
        res.status(500).send("Server Error");
        console.log(err.message);
    }

})

//@GET User Github profile
router.get('/github/:username', async(req, res) => {


    try {

        const uri = encodeURI(
            `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
        );
        const headers = {
            'user-agent': 'node.js',
            Authorization: `token ${config.get('githubToken')}`
        };
        const gitHubResponse = await axios.get(uri, { headers });
        return res.json(gitHubResponse.data);
    } catch (err) {
        console.error(err.message);
        return res.status(404).json({ msg: 'No Github profile found' });
    }
});
module.exports = router;