const Joi = require("joi");

const registerSchema = Joi.object({
  firstname: Joi.string().min(3).required().messages({
    "string.min": "Firstname must be at least 3 characters",
    "string.empty": "Firstname is required",
    "any.required": "Firstname is required",
  }),

  lastname: Joi.string().allow("", null),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),

  guestCart: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
      }).unknown(true), 
    )
    .optional(),
});

module.exports = { registerSchema, loginSchema };
