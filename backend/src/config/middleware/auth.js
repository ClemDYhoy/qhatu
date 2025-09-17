import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
const token = req.header('Authorization')?.replace('Bearer ', '');
if (!token) {
    return res.status(401).json({ error: 'Acceso denegado, token requerido' });
}

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
} catch (error) {
    res.status(401).json({ error: 'Token inválido' });
}
};

const adminMiddleware = (req, res, next) => {
if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado, solo administradores' });
}
next();
};

export { authMiddleware, adminMiddleware };