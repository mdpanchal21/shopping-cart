const Joi = require("joi");

const addressSchema = Joi.object({
  street: Joi.string().messages({
    "string.base": "Street must be a string",
  }),
  city: Joi.string().messages({
    "string.base": "City must be a string",
  }),
  state: Joi.string().messages({
    "string.base": "State must be a string",
  }),
  zipcode: Joi.string().messages({
    "string.base": "Zipcode must be a string",
  }),
  country: Joi.string().messages({
    "string.base": "Country must be a string",
  }),
});

const updateProfileSchema = Joi.object({
  firstname: Joi.string().min(2).max(50).messages({
    "string.base": "First name must be a string",
    "string.empty": "First name cannot be empty",
    "string.min": "First name should have a minimum length of 2",
    "string.max": "First name should have a maximum length of 50",
  }),

  lastname: Joi.string().min(1).max(50).allow("").messages({
    "string.base": "Last name must be a string",
    "string.max": "Last name should have a maximum length of 50",
  }),

  email: Joi.string().email().messages({
    "string.base": "Email must be a string",
    "string.email": "Please provide a valid email address",
  }),

  address: Joi.object({
    home: addressSchema,
    office: addressSchema,
  }).messages({
    "object.base": "Address must be an object",
  }),

  avatar: Joi.any(),
}).unknown(true);

const deleteAddressSchema = Joi.object({
  type: Joi.string()
    .valid("home", "office")
    .required()
    .messages({
      "any.required": "Address type is required",
      "any.only": "Address type must be either home or office",
    }),
});

module.exports = { updateProfileSchema, deleteAddressSchema };
