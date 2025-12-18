//controller for creating a resume
import mongoose from "mongoose";
import imagekit from "../configs/imageKit.js"; // ImageKit is correctly imported
import Resume from "../models/Resume.js"; // Assuming this is your Mongoose model
import fs, { fstat } from "fs";

//POST /api/resumes/create
export const createResume = async (req, res) => {
    try{
        const userId = req.userId;
        const {title} = req.body;

        // Convert userId string to ObjectId (Mongoose handles this automatically, but being explicit)
        const userObjectId = new mongoose.Types.ObjectId(userId);
        //create new resume
        const newResume = await Resume.create({userId: userObjectId, title});
        //return success message
        return res.status(201).json({message: "Resume created successfully", resume: newResume});

    }catch(error){
        return res.status(400).json({message: error.message});

    }
}

//controller for deleting a resume
//DELETE /api/resumes/delete
export const deleteResume = async (req, res) => {
    try{
        const userId = req.userId;
        const {resumeId} = req.params;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // TODO: ADD LOGIC HERE TO DELETE IMAGE FROM IMAGEKIT BEFORE DELETING THE DOCUMENT

        await Resume.findOneAndDelete({userId: userObjectId, _id: resumeId});
        //return success message
        return res.status(200).json({message: "Resume deleted successfully"});

    }catch(error){
        return res.status(400).json({message: error.message});

    }
}

//get resume by id for the authenticated user
//GET /api/resumes/get/:resumeId
export const getResumeById = async (req, res) => {
    try{
        const userId = req.userId;
        const {resumeId} = req.params;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const resume = await Resume.findOne({userId: userObjectId, _id: resumeId});
        if(!resume){
            return res.status(404).json({message: "Resume not found"})
        }
        //return success message
        resume.__v = undefined; 
        resume.createdAt = undefined;
        resume.updatedAt = undefined;
        return res.status(200).json({resume});

    }catch(error){
        return res.status(400).json({message: error.message});  
    }
}
//get resumes by id public
//GET /api/resumes/public
export const getPublicResumeById = async (req, res) => {
    try{
        const {resumeId} = req.params;
        const resume = await Resume.findOne({public: true, _id: resumeId});
        if(!resume){

            return res.status(404).json({message: "Resume not found"})
        }
        return res.status(200).json({resume});
    }catch(error){
        return res.status(400).json({message: error.message});
    }
}


//controller for updating a resume
//PUT /api/resumes/update
export const updateResume = async (req, res) =>{
    try{
        const userId = req.userId;
        const { resumeId, removeBackground } = req.body;
        const image = req.file;
        // normalize removeBackground flag (comes from form-data as string)
        const removeBgFlag = removeBackground === 'yes' || removeBackground === 'true' || removeBackground === true;
        
        // Parse resumeData if it exists in the request
        let resumeData = {};
        if (req.body.resumeData) {
            try {
                resumeData = typeof req.body.resumeData === 'string' 
                    ? JSON.parse(req.body.resumeData) 
                    : req.body.resumeData;
            } catch (error) {
                console.error('Error parsing resumeData:', error);
                return res.status(400).json({ message: 'Invalid resume data format' });
            }
        }

        // Support two cases:
        // 1) a freshly uploaded file via multipart/form-data (`req.file`)
        // 2) an existing image URL provided as `imageUrl` in the form body (client wants remove.bg applied to saved URL)

        let finalImageUrl = null;
        let imageBuffer = null;
        let imageMimetype = null;
        let fileName = null;

        if (image) {
            imageBuffer = image.buffer;
            imageMimetype = image.mimetype;
            fileName = `resume_${Date.now()}.${image.originalname.split('.').pop()}`;
        } else if (req.body.imageUrl) {
            try {
                console.log('Fetching remote image for processing:', req.body.imageUrl?.slice?.(0,200));
                const fetched = await fetch(req.body.imageUrl);
                if (!fetched.ok) {
                    console.warn('Failed to fetch imageUrl:', fetched.status);
                } else {
                    const arrayBuffer = await fetched.arrayBuffer();
                    imageBuffer = Buffer.from(arrayBuffer);
                    // Try infer mime type from headers or fallback to png
                    imageMimetype = fetched.headers.get('content-type') || 'image/png';
                    const urlParts = req.body.imageUrl.split('/');
                    const last = urlParts[urlParts.length - 1] || `image_${Date.now()}.png`;
                    const ext = last.includes('.') ? last.split('.').pop().split('?')[0] : (imageMimetype.includes('png') ? 'png' : 'jpg');
                    fileName = `resume_${Date.now()}.${ext}`;
                }
            } catch (fetchErr) {
                console.warn('Error fetching remote imageUrl, will skip background removal/upload:', fetchErr?.message || fetchErr);
            }
        }

        if (imageBuffer) {
            try {
                // If background removal is requested, call remove.bg API
                if (removeBgFlag && process.env.REMOVE_BG_API_KEY) {
                    try {
                        console.log('Calling remove.bg API to remove background (multipart form-data)...');
                        // Try multipart/form-data first (WHATWG FormData + Blob in Node 18+)
                        try {
                            const formData = new FormData();
                            const blob = new Blob([imageBuffer], { type: imageMimetype });
                            formData.append('image_file', blob, fileName);
                            formData.append('format', 'png');

                            const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
                                method: 'POST',
                                headers: {
                                    'X-Api-Key': process.env.REMOVE_BG_API_KEY,
                                },
                                body: formData,
                            });

                            console.log('remove.bg multipart response status:', removeBgResponse.status);

                            if (removeBgResponse.ok) {
                                const arrayBuffer = await removeBgResponse.arrayBuffer();
                                imageBuffer = Buffer.from(arrayBuffer);
                                fileName = `resume_${Date.now()}_no_bg.png`;
                                imageMimetype = 'image/png';
                                console.log('Background removed successfully (multipart)');
                            } else {
                                const text = await removeBgResponse.text();
                                console.warn('remove.bg multipart failed:', removeBgResponse.status, text?.slice?.(0,200));
                                // fall through to try base64 JSON approach
                                throw new Error('remove.bg multipart failed');
                            }
                        } catch (multipartErr) {
                            // Fallback: send base64 JSON payload to remove.bg (more reliable in some Node environments)
                            try {
                                console.log('Attempting remove.bg via base64 JSON fallback...');
                                const base64 = imageBuffer.toString('base64');
                                const jsonResp = await fetch('https://api.remove.bg/v1.0/removebg', {
                                    method: 'POST',
                                    headers: {
                                        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ image_file_b64: base64, format: 'png' })
                                });

                                console.log('remove.bg base64 response status:', jsonResp.status);
                                if (jsonResp.ok) {
                                    const arrayBuffer = await jsonResp.arrayBuffer();
                                    imageBuffer = Buffer.from(arrayBuffer);
                                    fileName = `resume_${Date.now()}_no_bg.png`;
                                    imageMimetype = 'image/png';
                                    console.log('Background removed successfully (base64)');
                                } else {
                                    const text = await jsonResp.text();
                                    console.warn('remove.bg base64 failed:', jsonResp.status, text?.slice?.(0,200));
                                    // give up and continue with original image
                                }
                            } catch (base64Err) {
                                console.warn('remove.bg base64 fallback failed, proceeding with original image:', base64Err?.message || base64Err);
                            }
                        }
                    } catch (bgError) {
                        console.warn('Background removal overall failed, proceeding with original image:', bgError?.message || bgError);
                    }
                }

                // Upload to ImageKit
                const base64Data = imageBuffer.toString('base64');
                const base64File = `data:${imageMimetype};base64,${base64Data}`;

                // ImageKit SDK uses imagekit.files.upload() method
                let response;
                try {
                    response = await imagekit.files.upload({
                        file: base64File,
                        fileName: fileName,
                        folder: 'user-resumes',
                    });
                    console.log('ImageKit upload success:', response?.fileId, response?.url);
                } catch (uploadError) {
                    console.error('ImageKit upload failed:', uploadError?.message || uploadError);
                    throw new Error(`ImageKit upload error: ${uploadError?.message || JSON.stringify(uploadError)}`);
                }

                // Ensure personal_info exists in resumeData
                if (!resumeData.personal_info) {
                    resumeData.personal_info = {};
                }

                // Extract URL from response
                const uploadedUrl = response?.url || response?.filePath || null;
                if (!uploadedUrl) {
                    console.warn('ImageKit upload returned no url, full response:', response);
                }
                resumeData.personal_info.image = uploadedUrl || '';

            } catch (error) {
                console.error('Error uploading image:', error?.response || error?.message || error);
                const errMsg = error?.response?.data || error?.message || String(error);
                return res.status(500).json({ message: 'Error uploading image', error: errMsg });
            }
        }
        // Ensure we only update resumes owned by the authenticated user
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, userId: userObjectId },
            resumeData,
            { new: true, runValidators: true }
        );

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found or not owned by user' });
        }

        return res.status(200).json({ message: "Resume updated successfully", resume });
    }catch(error){
        return res.status(400).json({message: error.message});
    }
}
// Toggle resume public/private
export const toggleResumeVisibility = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const userObjectId = new mongoose.Types.ObjectId(req.userId);

        const resume = await Resume.findOne({ _id: resumeId, userId: userObjectId });
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        // coerce to boolean to avoid string truthiness
        const incomingPublic = req.body.public;
        // accept boolean or string "true"/"false"
        resume.public = incomingPublic === true || incomingPublic === 'true';
        await resume.save();

        return res.json({ message: "Visibility updated", public: resume.public });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};