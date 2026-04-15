const Joi = require("joi");

const updateOrderSchema = Joi.object({
  orderId: Joi.string().required().messages({
    "string.empty": "Order ID is required",
    "any.required": "Order ID is required",
  }),
  newStatus: Joi.string()
    .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
    .required()
    .messages({
      "any.only": "Invalid order status",
      "any.required": "New status is required",
    }),
});

module.exports = { updateOrderSchema };