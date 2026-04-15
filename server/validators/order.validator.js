const Joi = require("joi");

const placeOrderSchema = Joi.object({
  addressType: Joi.string()
    .valid("home", "office")
    .required()
    .messages({
      "any.required": "Address type is required",
      "any.only": "Address type must be either home or office",
    }),

  paymentMode: Joi.string()
    .valid("COD", "Card", "UPI", "NetBanking")
    .required()
    .messages({
      "any.required": "Payment mode is required",
      "any.only": "Payment mode must be one of COD, Card, UPI, or NetBanking",
    }),
});

const cancelOrderSchema = Joi.object({
  orderId: Joi.string().required().messages({
    "any.required": "Order ID is required",
    "string.empty": "Order ID cannot be empty",
  }),
  newStatus: Joi.string()
    .valid("cancelled")
    .required()
    .messages({
      "any.required": "Status update is required",
      "any.only": "Users can only cancel their orders",
    }),
});

module.exports = { placeOrderSchema, cancelOrderSchema };
