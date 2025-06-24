const jwt = require('jsonwebtoken');

exports.generateTokens = (user) => {
  const payload = {
    id: user._id,
    userId: user.userId,
    role: user.role
  };
  // console.log("payload is",payload);

  const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET, {
    expiresIn: '1h'
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: '7d'
  });

  return { accessToken, refreshToken };
};
