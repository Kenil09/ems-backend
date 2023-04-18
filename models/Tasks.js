const { model, Schema } = require("mongoose");

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      enum: ["assigned", "review", "completed"],
      required: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Schema.Types.Date,
      required: true,
    },
    submissionFiles: [
      {
        type: String,
      },
    ],
    rating: {
      type: Schema.Types.String,
      min: 1,
      max: 5,
    },
    lateSubmissionReason: {
      type: String,
    },
    submissionDate: {
      type: Schema.Types.Date,
    },
    completedDate: {
      type: Schema.Types.Date,
    },
    reassigned: {
      type: Schema.Types.Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Task", taskSchema);
