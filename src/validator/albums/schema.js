const Joi = require('joi');

const CONSTRAINTS = {
  year: {
    MIN: 1900,
    MAX: new Date().getFullYear(),
  },
};

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number()
    .integer()
    .min(CONSTRAINTS.year.MIN)
    .max(CONSTRAINTS.year.MAX)
    .required(),
});

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string()
    .valid(
      'image/apng',
      'image/avif',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'image/webp'
    )
    .required(),
}).unknown();

module.exports = { AlbumPayloadSchema, ImageHeadersSchema };
