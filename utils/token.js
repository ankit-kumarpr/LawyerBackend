const jwt = require('jsonwebtoken');

exports.generateTokens = (user, role) => {
  const payload = { id: user._id, role };

  const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};
