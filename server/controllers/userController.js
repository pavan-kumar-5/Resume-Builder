
//controller for user registration
//POST /api/users/register
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Resume from "../models/Resume.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const generateToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: '7d'});
}

//POST /api/users/register
export const registerUser = async(req, res) => {
    try{
        const {name,email,password}=req.body;
        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        
        //check if user already exists}
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: "User already exists"});
        }
        //new user
        const hasshedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,email,password: hasshedPassword 
        });
        const token = generateToken(newUser._id);
        newUser.password = undefined;
        return res.status(201).json({message: "User registered successfully", user: newUser, token});
        
    }
    catch(error){
        return res.status(400).json({message: "Error registering user", error: error.message});
    }
}
//controller for user registration
//POST /api/users/register
export const loginUser = async (req, res) => {
    try{
        const {email,password}=req.body;
       
        //check if user already exists}
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid email or password"});
        }
        //check if password is correct
        if(!user.comparePassword(password)){
            return res.status(400).json({message: "Invalid email or password"});
        }
        //return success message
        const token = generateToken(user._id);
        user.password = undefined;
        return res.status(200).json({message: "Login successful", token, user: {_id: user._id, name: user.name, email: user.email}});
        
    }
    catch(error){
        return res.status(400).json({message: "Error registering user", error: error.message});
    }
}
//controller for getting user by id
//GET /api/users/data
export const getUserById = async (req, res) => {
    try{
        const userId = req.userId;
        
        //check if user already exists}
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        //return user
        user.password = undefined;



        return res.status(200).json({user});
        
    }
    catch(error){
        return res.status(400).json({message: "Error registering user", error: error.message});
    }
}
//controller for getting all resumes for a user
//GET /api/users/resumes
export const getUserResumes = async (req, res) => {
    try{
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({message: "User not authenticated"});
        }
        
        // Try querying with ObjectId (Mongoose should handle string conversion automatically, but being explicit)
        let resumes;
        try {
            const userObjectId = new mongoose.Types.ObjectId(userId);
            resumes = await Resume.find({userId: userObjectId});
        } catch (idError) {
            // If ObjectId conversion fails, try with string (Mongoose handles conversion)
            resumes = await Resume.find({userId: userId});
        }
        
        return res.status(200).json({resumes: resumes || []});
    }catch(error){
        console.error('Error fetching resumes:', error);
        return res.status(400).json({message: "Error fetching resumes", error: error.message});
    }
}