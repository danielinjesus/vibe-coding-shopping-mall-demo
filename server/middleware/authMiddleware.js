const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'fail', error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // req에 유저 정보 저장
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: 'fail', error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'fail', error: 'Token expired' });
    }
    return res.status(401).json({ status: 'fail', error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
