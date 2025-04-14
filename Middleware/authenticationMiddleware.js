const express = require('express');
const bycrypt = require('bcrypt');
const auth = express();
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY
const user = require('../Models/User');

module.exports = function authenticationMiddleware(req, res, next) {
    const cookie = req.cookies;// if not working then last option req.headers.cookie then extract token
    console.log('inside auth middleware')
    // console.log(cookie);

    if (!cookie) {
        return res.status(401).json({message: "No Cookie provided"});
    }
    const token = cookie.token;
    if (!token) {
        return res.status(405).json({message: "No token provided"});
    }

    jwt.verify(token, secretKey, (error, decoded) => {
        if (error) {
            return res.status(403).json({message: "Invalid token"});
        }


    auth.use(express.json());

    auth.post('/register', async (req, res) => {
        try {
            const {  email, password, role } = req.body;
            const finduser = user.find((date)=> date.email === email);
            if (finduser) {
                return res.status(409).json({message: "wrong email or password"});
            }
            const hashedPassword = await bycrypt.hash(password, 10);
            const newUser = new user({
                email,
                password: hashedPassword,
                role
            });
            await newUser.save();
            res.status(201).send({message: "User registered successfully"});
        } catch (err) {
            console.error(err);
            res.status(500).sen({messsage: err.meassage});
        }
    });
    auth.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            const finduser = user.find((date)=> date.email === email);
            if (!finduser) {
                return res.status(401).json({message: "wrong email or password"});
            }
            const isMatch = await bycrypt.compare(password, finduser.password);
            if (!isMatch) {
                return res.status(401).json({message: "wrong email or password"});
            }
            const token = jwt.sign({ id: finduser._id }, secretKey, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true });
            res.status(200).json({message: "Login successful", token});
        } catch (err) {
            console.error(err);
            res.status(500).send({message: err.message});
        }
    });
   auth.put('/forgetPassword', async (req, res) => {
       try{
              const { email, password } = req.body;
              const finduser = user.find((date)=> date.email === email);
              if (!finduser) {
                return res.status(401).json({message: "wrong email or password"});
              }
              const hashedPassword = await bycrypt.hash(password, 10);
              finduser.password = hashedPassword;
              await finduser.save();
              res.status(200).send({message: "Password updated successfully"});

       }catch (err){
           console.error(err);
           res.status(500).send({message: err.message});
       }

   });

    auth.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
        req.user = decoded;
        next();
    });
};

