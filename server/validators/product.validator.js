const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
    "string.min": "Name should have a minimum length of 3",
    "string.max": "Name should have a maximum length of 50",
    "any.required": "Name is required",
  }),

  price: Joi.number().greater(0).required().messages({
    "number.base": "Price must be a number",
    "number.greater": "Price must be greater than 0",
    "any.required": "Price is required",
  }),

  description: Joi.string()
    .allow("", null)
    .messages({ "string.base": "Description must be a string" }),

  productImage: Joi.any(),

  category: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "Category is required",
      "string.pattern.base": "Invalid Category ID format",
    }),

  createdBy: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "any.required": "CreatedBy is required",
      "string.pattern.base": "Invalid Category ID format",
    }),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(50).messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name should have a minimum length of 3",
    "string.max": "Name should have a maximum length of 50",
  }),

  price: Joi.number().greater(0).messages({
    "number.base": "Price must be a number",
    "number.greater": "Price must be greater than 0",
  }),

  description: Joi.string()
    .allow("", null)
    .messages({ "string.base": "Description must be a string" }),

  productImage: Joi.any(),

  category: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Invalid Category ID format",
    }),
});

module.exports = { createProductSchema, updateProductSchema };
