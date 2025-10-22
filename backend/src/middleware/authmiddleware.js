import jwt from 'jsonwebtoken';
import { User } from '@/model/model';

const JWT_SECRET = process.env.JWT_SECRET || 'iloveyou';

export const authenticateUser = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
