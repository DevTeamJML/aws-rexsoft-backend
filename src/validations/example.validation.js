const Joi = require('joi');

const example = {
  body: Joi.object().keys({
    objectExample: Joi.object().keys({ 
    }),
    arrayExample: Joi.array()
      .items()
      .min(1)
      .required(),
    stringExample: Joi.string(),
  }),
};

module.exports = {
    example
};
