const Joi = require("joi");

const bookAppointmentSchema = Joi.object({
  doctorId: Joi.string().required()
    .messages({ "any.required": "Doctor ID is required" }),

  date: Joi.alternatives().try(
    Joi.date(),
    Joi.string().trim()
  ).required()
    .messages({
      "any.required": "Date is required",
    }),

  slot: Joi.string().trim().required()
    .messages({ "any.required": "Time slot is required" }),

  notes: Joi.string().trim().max(500).allow("").optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "APPROVED", "COMPLETED", "CANCELLED")
    .required()
    .messages({
      "any.only": "Status must be PENDING, APPROVED, COMPLETED or CANCELLED",
      "any.required": "Status is required",
    }),

  prescription: Joi.string().trim().max(2000).allow("").optional(),
});

module.exports = { bookAppointmentSchema, updateStatusSchema };
