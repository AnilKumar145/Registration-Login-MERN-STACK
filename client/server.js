const express = require('express');
const mongoose = require('mongoose');
const Registeruser = require('./model');
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const cors = require('cors');
const app = express();

mongoose.connect('mongodb+srv://root:12345@cluster1.jojyfkl.mongodb.net/')
.then(() => console.log('DB connected.....'))
.catch(err => console.log('DB connection error:', err));

app.use(express.json());

app.use(cors({origin:"*"}))


app.post('/register', async (req,res) => {
    try{
        const {username,email,password,confirmpassword} = req.body;
        let exist = await Registeruser.findOne({email});
        if(exist){
            return res.status(400).send("User Already Exist's");
        }
        if(password !== confirmpassword){
            return res.status(400).send("Password's are not matching!!");
        }
        let newUser = new Registeruser({
            username,
            email,
            password,
            confirmpassword
        })

        await newUser.save();
        return res.status(200).send("Succesfully Registered!");


    }
    catch(err)
    {
        console.log(err.message)
        return res.status(500).send('Internal Server Error');
    }
})


app.post('/login', async (req,res) => {
    try{
        const {email,password} = req.body;
        let exist = await Registeruser.findOne({email});
        if(!exist){
            return res.status(400).send('User not found in database');
        }
        if(exist.password !== password){
            return res.status(400).send('Invalid Credentials');
        }

        let payload = {
            user : {
                id:exist.id
            }
        }

        jwt.sign(payload,'jwtSecret',{expiresIn:3600000},
            (err,token) => {
                if (err) throw err;
                return res.json({token})
            }
        )

    }
    catch(err){
        console.log(err.message);
        return res.status(500).send("Server Error");
    }
})


app.get('/myprofile', middleware, async(req,res) => {
    try{

        let exist = await Registeruser.findById(req.user.id);
        if(!exist){
            return res.status(400).send("User Not Found");
        }
        res.json(exist);
    }
    catch(err)
    {
        console.log(err.message);
        return res.status(500).send("Internal Server Error");
    }
})

app.listen(5000, () => {
    console.log("Server is running...");
});
