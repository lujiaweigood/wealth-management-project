const express = require("express");
const router = express.Router();
const data = require("../data");
const userData = data.users;
const validation = require("../validation");

router.get('/', async (req, res) => {
    if (req.session.username) {
        res.redirect("/trade");
    }
    else {
        res.render("login", {
            title: 'Log In',
            authenticated: false,
        });
    }
});

router.get('/signup', async (req, res) => {
    if (req.session.username) {
        res.redirect("/trade");
    }
    else {
        res.render("signUp", {
            title: 'Sign Up',
            authenticated: false,
        });
    }
});

router.post('/signup', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let gender = req.body.gender;
    let errors = [];

    try {
        username = validation.checkUsername(username, "Username");
        password = validation.checkPassword(password, "Password");
    } catch(e) {
        errors.push(e);
        return res.status(400).render('signup', {
            title: "Error",
            authenticated: false,
            errors: errors
        });
    }

    try {
        let signupResult = await userData.createUser(username, password, email, gender);
        if (!signupResult) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.redirect("/");
        }
    } catch(e) {
        errors.push(e);
        return res.status(400).render("signup", {
          title: "Error",
          authenticated: false,
          errors: errors,
        });
    }

});

router.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let errors = [];

    try {
        username = validation.checkUsername(username, "Username");
        password = validation.checkPassword(password, "Password");
    } catch(e) {
        errors.push(e);
        return res.status(400).render('login', {
            title: "Error",
            authenticated: false,
            errors: errors
        });
    }

    try {
        let loginResult = await userData.checkUser(username, password);
        if (loginResult.authenticated == true) {
            req.session.username = username;
            res.redirect("/trade");
        }
    } catch(e) {
        errors.push(e);
        return res.status(400).render("login", {
          title: "Error",
          authenticated: false,
          errors: errors,
        });
    }
});

router.get('/trade', async(req,res) =>{
    if (req.session.username) {
        res.render("trade");
    }
});

router.get('/logout', async(req,res) =>{
    req.session.destroy();
    res.render("logout", { title: "Log Out" });
});

module.exports = router;