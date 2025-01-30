const Joi = require('joi');

const CONSTRAINTS = {
  year: {
    MIN: 1900,
    MAX: new Date().getFullYear(),
  },
};

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number()
    .integer()
    .min(CONSTRAINTS.year.MIN)
    .max(CONSTRAINTS.year.MAX)
    .required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

module.exports = { SongPayloadSchema };
