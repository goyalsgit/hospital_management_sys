const Joi = require("joi");

// Joi schema = rules for what request body should look like
// If data doesn't match → returns clear error message
// Much better than manual if(!name) checks

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required()
    .messages({
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name must be less than 50 characters",
      "any.required": "Name is required",
    }),

  email: Joi.string().trim().lowercase().email().required()
    .messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),

  password: Joi.string().min(6).max(128).required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),

  phone: Joi.string().trim().allow("").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required()
    .messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),

  password: Joi.string().required()
    .messages({
      "any.required": "Password is required",
    }),
});

const registerDoctorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().trim().allow("").optional(),
  specialization: Joi.string().trim().required()
    .messages({ "any.required": "Specialization is required" }),
  experience: Joi.number().min(0).max(60).required()
    .messages({ "any.required": "Experience is required" }),
  fees: Joi.number().min(0).required()
    .messages({ "any.required": "Fees is required" }),
  availableSlots: Joi.array().items(Joi.string()).optional(),
  bio: Joi.string().trim().max(500).allow("").optional(),
});

module.exports = { registerSchema, loginSchema, registerDoctorSchema };
