const router = require('express').Router();
const User = require('../model/User');
const { registerValidation, loginValidation } = require('./validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { sendEmail } = require('./mail');

router.post('/register', async (req, res, next) => {

    //Validation of data

    const { error } = registerValidation(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    // Check User if already exists

    const emailExists = await User.findOne({ email: req.body.email });

    if (emailExists) return res.status(400).send('Email Already Exists');

    //Hash Password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        await user.save();
        // res.send({ user: users._id });
    } catch (err) {
        return res.status(400).send({ message: 'Failed to create user.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
    link = 'http://localhost:3000/api/user/verify?token=' + token;
    message = {
        subject: 'Agora Verification  EMail',
        link: link,
        html: `<p>Hi ${user.name}<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p><br><p>If you did not request this, please ignore this email.</p>`
    };

    console.log(message);

    // Send verification mail
    try {
        await sendEmail(user.email, message);
    } catch (e) {
        console.log('MAIL Error : ' + e);
        return res.status(200).send({ user: user.toObject({ getters: true }), message: 'Failed to send verification email to : ' + user.email });
    }

    res.status(200).send({ user: user.toObject({ getters: true }).id, message: 'Verification email is sent to : ' + user.email });

});

// Login
router.post('/login', async (req, res) => {

    //Validation of data

    const { error } = loginValidation(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    // Check for Email Id
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).send('Email is wrong');

    //Password Is Correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Invalid Password');

    if (!user.active) return res.status(403).send('Please verify the account by clicking the link sent to email : ' + user.email);

    //Create and assign a Token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });

    res.header('auth-token', token).send(token);

    // res.send('Login Successfull');

});

router.get('/verify', async (req, res, next) => {
    try {
        let token = req.query.token;
        console.log('Verification token : ' + token);
        if (!token) {
            throw new Error('Authentication Failed.');
        }
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const userId = decodedToken.userId;
        const email = decodedToken.email;
        let user = await User.findById({ _id: userId });

        if (user.email === email) {
            user.active = true;
            await user.save();
        }
        // req.user = { userId: decodedToken.userId, email: decodedToken.email };
        res.send({ userId: userId, email: email, message: 'Account verified successfully.' });
    } catch (err) {
        res.send({ message: 'Account verification failed.' });
    }
});

module.exports = router; 
