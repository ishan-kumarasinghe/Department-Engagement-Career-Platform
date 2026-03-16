const crypto = require('crypto');

const unauthorized = (message = 'Unauthorized') => {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
};

const parseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const decodeJwtSegment = (segment) => {
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
  } catch {
    throw unauthorized('Invalid token format');
  }
};

const verifyHs256 = (token, secret) => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw unauthorized('Invalid token format');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const header = decodeJwtSegment(encodedHeader);
  const payload = decodeJwtSegment(encodedPayload);

  if (header.alg !== 'HS256') {
    throw unauthorized('Unsupported token algorithm');
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  const actualSignature = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    actualSignature.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualSignature, expectedBuffer)
  ) {
    throw unauthorized('Invalid token signature');
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw unauthorized('Token expired');
  }

  return payload;
};

const extractSnapshot = (payload, headers) => {
  const inlineSnapshot = parseJson(headers['x-user-snapshot']);

  return {
    name:
      payload.name ||
      payload.fullName ||
      inlineSnapshot?.name ||
      headers['x-user-name'] ||
      'Unknown User',
    profilePicUrl:
      payload.profilePicUrl ||
      payload.avatarUrl ||
      inlineSnapshot?.profilePicUrl ||
      headers['x-user-profile-pic-url'] ||
      '',
    headline:
      payload.headline ||
      payload.bio ||
      inlineSnapshot?.headline ||
      headers['x-user-headline'] ||
      ''
  };
};

const requireAuth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw unauthorized();
    }

    const payload = verifyHs256(token, process.env.JWT_SECRET || 'decp-dev-secret');
    const userId = payload.userId || payload.id || payload.sub;

    if (!userId) {
      throw unauthorized('Token missing user identifier');
    }

    req.user = {
      id: userId,
      role: payload.role || 'student',
      email: payload.email || '',
      snapshot: extractSnapshot(payload, req.headers)
    };

    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(unauthorized());
  }

  if (!allowedRoles.includes(req.user.role)) {
    const error = new Error('You do not have permission to perform this action');
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

module.exports = {
  requireAuth,
  requireRole
};
