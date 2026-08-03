// Middlewares de seguridad:
//  - authenticate: valida el JWT enviado en el header Authorization y
//    cuelga el usuario decodificado en req.user para las siguientes capas.
//  - authorize(...roles): restringe una ruta a uno o varios roles.
//    Implementa el criterio de aceptación de RF-10: "el sistema
//    restringe accesos según el rol asignado".
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization; // formato esperado: "Bearer <token>"
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: 'No tiene permisos para realizar esta acción' });
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
