require('dotenv').config()
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("./db/conn");
const path = require("path");
const hbs = require("hbs");
const Register = require("./models/registers");
const { cp } = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { cookie } = require('express/lib/response');
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth")

//using static index.html and template for hbs
app.use(cookieParser());

const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../templates/views")
const partial_path = path.join(__dirname, "../templates/partials");

console.log(process.env.SECRET_KEY)
app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
//using hbs veiw engine index.hbs
app.set("view engine", "hbs");

//telling express that views is now template_path
app.set("views", template_path)
hbs.registerPartials(partial_path);

app.get("/", (req, res) => {
    // we write render while using temp engine and index is index.hbs but no need to write hbs while declearing
    res.render("index");
})
app.get("/secret", auth, (req, res) => {
    // we write render while using temp engine and index is index.hbs but no need to write hbs while declearing
    res.render("secret");
    console.log(`this is the cookie login get ${req.cookies.jwt}`)
})
app.get("/login", (req, res) => {
    // we write render while using temp engine and index is index.hbs but no need to write hbs while declearing
    res.render("login");
})

// // creating a new user
app.post("/", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (password === cpassword) {
            const registerEmployee = new Register({
                name: req.body.name,
                email: req.body.email,
                age: req.body.age,
                phone: req.body.phone,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
                gender: req.body.gender,
            })

            const token = await registerEmployee.generateAuthToken();

            //res.cookie() is a function that use to set the cookie name o value
            // the value parameter may be string or object converted to json
            // res.cookie(name, value, options)
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true
            });
            console.log(cookie)


            const registered = await registerEmployee.save();
            res.status(201).render("index")
        } else {
            res.send("password is not mathing!")
        }


    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }

})

// //login check here
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const useremail = await Register.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, useremail.password);
        const token = await useremail.generateAuthToken();
        console.log(`here is the ${token}`)

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 90000),
            httpOnly: true
        });


        // console.log(cookie)
        // console.log(`this is the cookie login get ${req.cookies.jwt}`)

        if (isMatch) {
            res.status(201).render('index');
        } else {
            res.send("invalid ");
        }
        //  console.log(`${email}and ${password} `)

    } catch (error) {
        res.status(501).send(error);
        console.log(error);
    }
})


//  //hashing by bcrypt

//  const securePassword = async(password)=>{

//     const passwordHash = await bcrypt.hash(password, 10)
//     const passwordMatch = await bcrypt.compare(password, passwordHash)
//     console.log(passwordMatch)

//  }

//  securePassword("Minahil") 

//creating jwt token for auth


const createToken = async () => {
    const token = await jwt.sign({ _id: "65785c93018ec6b5c082d839" }, "mynameisminahilakhtariamadeveloper", {
        expiresIn: "2 minutes"
    });
    console.log(token);

    const userVar = await jwt.verify(token, "mynameisminahilakhtariamadeveloper")
    console.log(userVar)
}
createToken()

app.listen(port, () => {
    console.log(`listning  on port# ${port}`)
})