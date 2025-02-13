const Jwt = require('@hapi/jwt');
const config = require('../utils/config');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, config.jwt.accessKey),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, config.jwt.refreshKey),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, config.jwt.refreshKey);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;
