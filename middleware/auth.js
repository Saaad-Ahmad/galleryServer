import jwt from 'jsonwebtoken';

function auth(req, res, next) {
  const header = req.header('Authorization');
  if (!header) return res.status(401).json({ msg: 'No token provided' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: userId }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
}

export default auth;
