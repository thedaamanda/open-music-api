const Joi = require('joi');

const CONSTRAINTS = {
  year: {
    MIN: 1900,
    MAX: new Date().getFullYear()
  }
};

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(CONSTRAINTS.year.MIN).max(CONSTRAINTS.year.MAX).required(),
});

module.exports = { AlbumPayloadSchema };
