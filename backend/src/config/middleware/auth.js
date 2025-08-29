import jwt from 'jsonwebtoken';

const isAdmin = (req, res, next) => {
const token = req.headers.authorization?.split(' ')[1];
if (!token) return res.status(401).json({ error: 'No token proporcionado' });
try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado: No eres admin' });
    req.user = decoded;
    next();
} catch (err) {
    res.status(401).json({ error: 'Token inválido' });
}
};

export { isAdmin }; // Named export