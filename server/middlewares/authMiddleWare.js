import jwt from 'jsonwebtoken';


const protect = async (req, res, next) => {
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }
    try {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Handle `Bearer <token>` format
        if (typeof token === 'string' && token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Token is issued with payload `{ id: userId }` in userController.generateToken
        req.userId = decoded.id || decoded.userId || decoded.uid;
        // keep `req.user` for compatibility if other code expects it
        req.user = req.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

export default protect;