const { model, Schema } = require("mongoose");

const taskCommentSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("TaskComment", taskCommentSchema);
