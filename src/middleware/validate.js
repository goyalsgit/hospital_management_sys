// Reusable validation middleware factory
// Takes a Joi schema and returns middleware that validates req.body

const validate = (schema) => {
  return (req, res, next) => {
    // schema.validate(data, options)
    // abortEarly: false → show ALL errors, not just first one
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // Extract clean error messages from Joi
      const messages = error.details.map((detail) => detail.message);

      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
      });
    }

    // Validation passed — continue to controller
    next();
  };
};

module.exports = validate;
