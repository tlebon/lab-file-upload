const express = require('express');
const passport = require('passport');
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const Post = require('../models/Post')

router.get('/login', ensureLoggedOut(), (req, res) => {
    res.render('authentication/login', { message: req.flash('error') });
});

router.post('/login', ensureLoggedOut(), passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/signup', ensureLoggedOut(), (req, res) => {
    res.render('authentication/signup', { message: req.flash('error') });
});

router.post('/signup', ensureLoggedOut(), passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.get('/profile', ensureLoggedIn('/login'), (req, res) => {
    res.render('authentication/profile', {
        user: req.user
    });
});

router.get('/logout', ensureLoggedIn('/login'), (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/new-post', ensureLoggedIn('/login'), (req, res) => {
    res.render('new-post', {
        user: req.user
    })

});
router.post('/new-post', ensureLoggedIn('/login'), (req, res) => {

    // user:req.user
    const { photo } = req.files
    const { name } = req.body

    const path = `public/images/${photo.name}`

    photo.mv(path, function (err) {
        if (err) return res.status(500).send(err)
        let userId
        new Post({ name })
            .save()
            .then(user => {
                userId = user._id
                return upload(path)
            })
            .then(result => {
                return Post.findByIdAndUpdate(
                    userId,
                    {
                        picture: result.url,
                    },
                    { new: true }
                )
            })
            .then(user => {
                res.send(user)
            })
    })
})


module.exports = router;
