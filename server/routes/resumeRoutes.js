import express from "express";
import protect from "../middlewares/authMiddleWare.js";
import { createResume, deleteResume, getPublicResumeById, getResumeById, updateResume } from "../controllers/resumeController.js";
import upload from "../configs/multer.js";




const resumeRouter = express.Router();

resumeRouter.post('/create',protect,createResume);
// Ensure auth runs before multer so req.userId is available in controller
resumeRouter.put('/update', protect, upload.single('image'), updateResume);
resumeRouter.delete('/delete/:resumeId', protect,deleteResume);
resumeRouter.get('/get/:resumeId',protect,getResumeById);
resumeRouter.get('/public/:resumeId',getPublicResumeById);


export default resumeRouter;    