const FormSchema = require("../model/formSchema.model");

exports.createSchema = async (req, res) => {
  try {
    const { entity, fields } = req.body;

    const existingSchema = await FormSchema.findOne({ entity });
    if (existingSchema) {
      return res.status(409).json({
        message:
          "Schema for this entity already exists",
        success: false,
      });
    }

    const newSchema = new FormSchema({
      entity,
      fields,
    });

    await newSchema.save();

    return res.status(201).json({
      message: "Form schema added successfully",
      success: true,
      data: newSchema,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        success: false,
        error: err.message,
      });
    }
    if (err.code === 11000) {
      return res.status(409).json({
        message: "This entity already exists",
        success: false,
      });
    }
    return res.status(500).json({
      message: "Server error while adding form schema",
      success: false,
      error: err.message,
    });
  }
};

exports.getAllSchemas = async (req, res) => {
  try {
    const schemas = await FormSchema.find().select("-__v -_id -fields._id -createdAt -updatedAt").lean();

    const formattedSchemas = schemas.reduce((acc, schema) => {
      acc[schema.entity] = {
        entity: schema.entity,
        fields: schema.fields.map((field) => ({
          name: field.name,
          label: field.label,
          type: field.type,
          placeholder: field.placeholder,
          defaultValue: field.defaultValue,
          validation: field.validation,
        })),
      };
      return acc;
    }, {});

    return res.status(200).json({
      message: "All form schemas fetched successfully",
      success: true,
      data: formattedSchemas,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error while fetching all form schemas",
      success: false,
      error: err.message,
    });
  }
};

exports.updateSchema = async (req, res) => {
  try {
    const { entity } = req.params;
    const { fields } = req.body;

    if (!entity) {
      return res.status(400).json({
        message: "Entity name is required",
        success: false,
      });
    }

    const currentSchema = await FormSchema.findOne({ entity });

    if (!currentSchema) {
      return res.status(404).json({
        message: `No form schema found for entity: ${entity}`,
        success: false,
      });
    }

    if (fields && Array.isArray(fields)) {
      fields.forEach((newField) => {
        const fieldIndex = currentSchema.fields.findIndex(
          (f) => f.name === newField.name,
        );

        if (newField.delete === true) {
          if (fieldIndex !== -1) {
            currentSchema.fields.splice(fieldIndex, 1);
          }
        } else if (fieldIndex !== -1) {
          const existingField = currentSchema.fields[fieldIndex].toObject();
          currentSchema.fields[fieldIndex] = {
            ...existingField,
            ...newField,
          };
        } else {
          currentSchema.fields.push(newField);
        }
      });
    }

    await currentSchema.save();

    return res.status(200).json({
      message: "Form schema updated successfully",
      success: true
      // data: currentSchema,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        success: false,
        error: err.message,
      });
    }
    return res.status(500).json({
      message: "Server error while updating form schema",
      success: false,
      error: err.message,
    });
  }
};

exports.deleteSchema = async (req, res) => {
  try {
    const { entity } = req.params;

    if (!entity) {
      return res.status(400).json({
        message: "Entity name is required",
        success: false,
      });
    }

    const deletedSchema = await FormSchema.findOneAndDelete({ entity });

    if (!deletedSchema) {
      return res.status(404).json({
        message: `No form schema found for entity: ${entity}`,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Form schema deleted successfully",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error while deleting form schema",
      success: false,
      error: err.message,
    });
  }
};
