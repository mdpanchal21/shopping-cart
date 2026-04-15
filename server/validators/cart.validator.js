const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const addToCartSchema = Joi.object({
  productId: Joi.string()
    .regex(objectIdPattern)
    .required()
    .messages({
      "any.required": "Product ID is required",
      "string.empty": "Product ID cannot be empty",
      "string.pattern.base": "Invalid Product ID format",
    }),

  quantity: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be a whole number",
    "number.min": "Quantity must be at least 1",
  }),
});

const removeFromCartSchema = Joi.object({
  productId: Joi.string()
    .regex(objectIdPattern)
    .required()
    .messages({
      "any.required": "Product ID is required",
      "string.empty": "Product ID cannot be empty",
      "string.pattern.base": "Invalid Product ID format",
    }),
});

module.exports = { addToCartSchema, removeFromCartSchema };
