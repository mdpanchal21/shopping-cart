const Joi = require("joi");

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "Name should be a type of text",
    "string.empty": "Name cannot be an empty field",
    "string.min": "Name should have a minimum length of 2",
    "string.max": "Name should have a maximum length of 50",
    "any.required": "Name is a required field",
  }),

  slug: Joi.string().required().trim().lowercase().min(2).max(50).messages({
    "string.base": "Slug should be a type of text",
    "string.empty": "Slug cannot be an empty field",
    "string.min": "Slug should have a minimum length of 2",
    "string.max": "Slug should have a maximum length of 50",
    "any.required": "Slug is a required field",
  }),
});

const updateCategorySchema = Joi.object({
  categoryId: Joi.string().required().messages({
    "any.required": "Category ID is required",
  }),
  name: Joi.string().trim().min(2).max(50).messages({
    "string.min": "Name should have a minimum length of 2",
    "string.max": "Name should have a maximum length of 50",
  }),
  slug: Joi.string().trim().lowercase().min(2).max(50).messages({
    "string.min": "Slug should have a minimum length of 2",
    "string.max": "Slug should have a maximum length of 50",
  }),
}).min(2); 

module.exports = { createCategorySchema, updateCategorySchema };
