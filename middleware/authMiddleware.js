
const jwt = require('jsonwebtoken');
const Hr = require('../models/SignUp'); // Adjust model import as needed


function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded; // Set decoded user information in req.user
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
module.exports = authMiddleware;

