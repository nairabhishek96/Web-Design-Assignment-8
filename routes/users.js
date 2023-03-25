const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require("bcrypt");
const saltRounds = 10;

var passwordValidator = require("password-validator");
var validator = require("email-validator");

// Create a schema
var schema = new passwordValidator();

// Add properties to it
schema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits(2)
    .has().not().spaces()
    .is().not().oneOf(["Passw0rd", "Password123"]);

//Get all users stored in the table
router.get('/getAll/', async (req, res) => {

    try {
        const users = await User.find()
        res.send(users)
    } catch (err) {
        res.send('Error' + err)
        res.status(500).send({ message: 'Internal server error' });
    }
})

//Get the user by the specific id
router.get('/getAll/:id', async (req, res) => {

    try {
        const user = await User.findById(req.params.id)
        res.send(user)
    } catch (err) {
        res.send('Error' + err)
        res.status(500).send({ message: 'Internal server error' });
    }
})

//Create a new user in the database
router.post('/create/', async (req, res) => {

    let temporaryPassword = null;
    const fullName = req.body.fullName;

    if (validator.validate(req.body.email) == false) {
        return res.send({ message: "Enter valid Email Id" });
    } else if (schema.validate(req.body.password) == false) {
        return res.send({ message: "Weak password" });
    } else if (fullName.length == 0 || fullName.length >= 10) {
        return res.send({ message: "Enter valid full name" });
    } else {

        const temporaryUser = await User.findOne({ email: req.body.email });

        if (temporaryUser != null) {
            return res.send({ message: "User with this email already exists" });
        }
        await bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
            temporaryPassword = hash;
            console.log(hash);
        });
        console.log(temporaryPassword);

        const user = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            password: temporaryPassword
        })

        try {
            const a1 = await user.save()
            res.json(a1)
        } catch (err) {
            res.send('Error' + err)
            res.status(500).send({ message: 'Internal server error' });
        }
    }
})

//Put request for updated fields in the json
router.put('/edit/:email', async (req, res) => {

    const password = req.body.password;
    const fullName = req.body.fullName;
    const paramEmail = req.params.email;
    const salt = await bcrypt.genSalt(10);
    const password1 = await bcrypt.hash(password, salt);

    if (fullName.length == 0 || fullName.length >= 10) {
        return res.send({ message: "Enter valid full name" });
    } else if (schema.validate(password) == false) {
        return res.send({ message: "Weak password" });
    } else {

        try {
            // console.log(paramEmail)
            const user = await User.findOne({ email: paramEmail })

            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }

            user.fullName = fullName
            user.password = password1
            const a1 = await user.save()
            res.json(a1)
            return;

        } catch (err) {
            res.send('Error' + err)
            res.status(500).send({ message: 'Internal server error' });
        }
    }
})  


//Delete a user in the database
router.delete('/delete/:email', async (req, res) => {

    const userEmail = req.params.email;

    try {
        const user = await User.findOneAndDelete({ email: userEmail })
        res.send("Successfully deleted");
    } catch (err) {
        res.send('Error' + err)
        res.status(500).send({ message: 'Internal server error' });
    }
})

module.exports = router