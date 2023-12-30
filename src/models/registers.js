const mongoose = require("mongoose");
const bcrypt= require("bcryptjs")
const jwt = require("jsonwebtoken");
const { response } = require("express");


const employeSchema = new mongoose.Schema({
    name:{
        type:String,
        require: true
    },
    email:{
        type: String,
        require: true,
        unique: true
    },
    age:{
        type: Number,
        required: true
    },
    phone:{
        type: Number,
        required: true,
        unique:true

    },
    password:{
        type:String,
        require: true,
        unique:true
    },
    confirmpassword:{
        type:String,
        require: true,
    },
    gender:{
        type:String,
        require: true,
        
    },
    tokens:[{
        token: {
            type:String,
        require: true,
        }
    }]

})

//generating tokens

employeSchema.methods.generateAuthToken = async function(){
    try {
        // console.log(this._id)
        const token = jwt.sign({_id: this._id.toString()}, process.env.SECRET_KEY)
        // console.log(token)
        this.tokens = this.tokens.concat({token: token});
        await this.save();
        return token
    } catch (error) {
        response.send(`the eror is ${error}`)
        console.log(`the eror is ${error}`)
    }
}



//creating pre for hashing password

employeSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
        
        // console.log(`current pass is ${this.password}`)
        this.password = await bcrypt.hash(this.password, 10)
        // console.log(`current pass is ${this.password}`)
        this.confirmpassword =  await bcrypt.hash(this.password, 10);
    } 
        next()

       
})

//creatig collection now

const Register = new mongoose.model("Register", employeSchema);
module.exports = Register