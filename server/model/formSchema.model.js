const mongoose = require("mongoose");

const FormFieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Field name is required"],
      trim: true,
    },
    label: {
      type: String,
      required: [true, "Field label is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "text",
        "number",
        "email",
        "password",
        "textarea",
        "select",
        "radio",
        "checkbox",
        "file",
        "date",
      ],
      required: true,
    },
    placeholder: {
      type: String,
      trim: true,
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    validation: {
      required: {
        type: Boolean,
        default: false,
      },
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
      pattern: {
        type: String,
      },
      errorMessage: {
        type: String,
      },
    },
  },
);

const FormSchema = new mongoose.Schema(
  {
    entity: {
      type: String,
      required: [true, "Entity name is required"],
      unique: true,
      enum: {
        values: ["product", "category", "profile", "order"],
        message: "{VALUE} is not a valid entity",
      },
      lowercase: true,
      trim: true,
    },
    fields: [FormFieldSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("formschema", FormSchema);
