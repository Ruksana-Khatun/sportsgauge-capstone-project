const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Token header se lo
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token.' 
    });
  }
};

const adminMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check karo admin hai ya nahi
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admins only.' 
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token.' 
    });
  }
};

module.exports = { authMiddleware, adminMiddleware };