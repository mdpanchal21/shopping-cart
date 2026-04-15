const Joi = require("joi");

const getProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be a whole number",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(100).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be a whole number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),

  category: Joi.string().allow("", "All").messages({
    "string.base": "Category must be a string",
  }),

  search: Joi.string().allow("").max(100).messages({
    "string.base": "Search must be a string",
    "string.max": "Search query cannot exceed 100 characters",
  }),
});

module.exports = { getProductsQuerySchema };
