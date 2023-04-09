const { model, Schema } = require("mongoose");

const notificationSchema = new Schema(
  {
    user: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Notification", notificationSchema);
