const Joi = require("joi");
const Tasks = require("../models/Tasks");
const dayjs = require("dayjs");
const uploadFilesToS3 = require("../utils/upload/uploadFilesToS3");
const TaskComment = require("../models/TaskComment");
const Notification = require("../models/Notification");
const deleteS3Folder = require("../utils/upload/removeFolderFromS3");
const removeFilesFromS3 = require("../utils/upload/removeFilesFromS3");

const createTaskValidation = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  assignee: Joi.string().required(),
  reporter: Joi.string().required(),
  dueDate: Joi.date().required(),
});

const taskCommentValidation = Joi.object({
  task: Joi.string().required(),
  user: Joi.string().required(),
  message: Joi.string().required(),
});

const completeTaskValidation = Joi.object({
  rating: Joi.number().min(1).max(5),
});

const updateTaskValidation = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  reporter: Joi.string(),
  assignee: Joi.string(),
  dueDate: Joi.string(),
});

// Notify assignee
exports.createTask = async (req, res) => {
  try {
    const validateRequest = createTaskValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const { files } = req;
    const task = new Tasks({ ...req.body, state: "assigned" });
    if (files.length) {
      const response = await uploadFilesToS3(
        files,
        process.env.BUCKET,
        `tasks/${task._id.toString()}/attachments`
      );
      const badResponse = response.filter(
        (resp) => resp.$metadata.httpStatusCode !== 200
      );
      if (badResponse.length) {
        return res
          .status(500)
          .json({ message: "Error while submitting files" });
      }
    }

    const result = await (await task.save()).populate(["assignee", "reporter"]);
    res
      .status(201)
      .json({ message: "Task assigned successfully", task: result });
  } catch (error) {
    console.log("create tasks", error, error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.submitTask = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "bad request" });
    }
    const task = await Tasks.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const { files } = req;
    if (files.length === 0) {
      return res.status(400).json({ message: "Please enter the file name" });
    }
    const response = await uploadFilesToS3(
      files,
      process.env.BUCKET,
      `tasks/${task._id.toString()}/submission`
    );
    const badResponse = response.filter(
      (resp) => resp.$metadata.httpStatusCode !== 200
    );
    if (badResponse.length) {
      return res.status(500).json({ message: "Error while submitting files" });
    }
    task.state = "review";
    task.submissionDate = dayjs().toISOString();
    if (dayjs().isAfter(dayjs(task.dueDate))) {
      task.lateSubmissionReason = req.body.lateSubmissionReason;
    }
    const result = await (await task.save()).populate(["assignee", "reporter"]);
    res
      .status(200)
      .json({ message: "Task submitted successfully", task: result });
  } catch (error) {
    console.log("submitting task error", error);
    res.status(500).json({ message: "Internal server error " });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const validateRequest = completeTaskValidation.validate(req.body);
    if (!req.params.id) {
      return res.status(400).json({ message: "bad request" });
    }
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const task = await Tasks.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    task.rating = req.body.rating;
    task.completedDate = dayjs().toISOString();
    task.state = "completed";
    const result = await (await task.save()).populate(["assignee", "reporter"]);
    res
      .status(200)
      .json({ message: "Task completed successfully", task: result });
  } catch (error) {
    console.log("completing task error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserTasks = async (req, res) => {
  try {
    const tasks = await Tasks.find({ assignee: req.params.id })
      .populate("assignee")
      .populate("reporter");
    res.status(200).json({ tasks });
  } catch (error) {
    console.log("get task error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.reassignTask = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "bad request" });
    }
    const task = await Tasks.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    task.state = "assigned";
    task.reassigned = true;
    const result = await (await task.save()).populate(["assignee", "reporter"]);
    res
      .status(200)
      .json({ message: "Task Re Opened successfully", task: result });
  } catch (error) {
    console.log("reassign task error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const validateRequest = updateTaskValidation.validate(req.body);
    if (!req.params.id) {
      return res.status(400).json({ message: "bad request" });
    }
    const task = await Tasks.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Unable to find the task" });
    }
    const allowedUpdates = [
      "title",
      "descirption",
      "assignee",
      "reporter",
      "dueDate",
    ];
    const updates = Object.keys(req.body);
    updates.every((update) => {
      if (!allowedUpdates.includes(update)) {
        return res.status(401).json({ message: `${update} is not allowed` });
      }
    });
    updates.forEach((update) => (task[update] = req.body[update]));
    let result = await (await task.save()).populate(["assignee", "reporter"]);
    res
      .status(200)
      .json({ message: "Task updated successfully", task: result });
  } catch (error) {
    console.log("task update", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.commentOnTask = async (req, res) => {
  try {
    const validateRequest = taskCommentValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const task = await Tasks.findById(req.body.task).lean();
    let users = [task.reporter.toString(), task.assignee.toString()].filter(
      (id) => id !== req.user?._id.toString()
    );
    console.log(users);

    const notification = new Notification({
      message: `${req.user?.firstName} ${req.user?.lastName} has commented on task ${task?.title}`,
      user: users,
    });
    await notification.save();
    const newComment = new TaskComment(req.body);
    const comment = (await newComment.save()).populate(["user"]);
    res.status(200).json({ message: "Comment added successfully", comment });
  } catch (error) {
    console.log("comment add error", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTaskComments = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(404).json({ message: "Invalid request" });
    }
    const comments = await TaskComment.find({ task: req.params.id })
      .populate("user")
      .sort({ createdAt: -1 });
    res.status(200).json({ comments });
  } catch (error) {
    console.log("Get task comment", error.message);
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Tasks.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await deleteS3Folder(process.env.BUCKET, `tasks/${req.params.id}/`)
      .then(async () => {
        await task.delete();
        return res.status(200).json({ message: "Task deleted successfully" });
      })
      .catch((error) => {
        console.log("err", error);
        return res.status(500).json({ message: "Error removing files" });
      });
  } catch (error) {
    console.log("Task delete error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const task = await Tasks.findById(req.body.taskId);
    if (!task) {
      return res.status(200).json({ message: "Task not found" });
    }
    const response = await removeFilesFromS3(process.env.BUCKET, req.body.key);
    if (response.$metadata.httpStatusCode !== 204) {
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(200).json({ message: "File removed successfully" });
  } catch (error) {
    console.log("Task file delete error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
