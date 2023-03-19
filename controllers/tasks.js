const Joi = require("joi");
const Tasks = require("../models/Tasks");
const dayjs = require("dayjs");
const uploadFilesToS3 = require("../utils/upload/uploadFilesToS3");

const createTaskValidation = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  assignee: Joi.string().required(),
  reporter: Joi.string().required(),
  dueDate: Joi.date().required(),
});

const completeTaskValidation = Joi.object({
  rating: Joi.number().min(1).max(5),
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
    const task = new Tasks({ ...req.body, state: "assigned" });
    const result = await (await task.save()).populate(["assignee", "reporter"]);
    res
      .status(201)
      .json({ message: "Task assigned successfully", task: result });
  } catch (error) {
    console.log("create tasks", error);
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
      `tasks/${task._id.toString()}`
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
    const result = await (await task.save()).populate(["assignee", "reporter"]);
    res
      .status(200)
      .json({ message: "Task completed successfully", task: result });
  } catch (error) {
    console.log("completing task error", error);
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
    const result = await (await task.save()).populate(["assignee", "reporter"]);
    res
      .status(200)
      .json({ message: "Task completed successfully", task: result });
  } catch (error) {
    console.log("reassign task error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*
Api and socket thing needed in this
Create task - notify assignee
submitTask - multipart form data api - { state: 'review', submissionFiles: [] }
completeTask - rating will added
sendBackTask - reassign task for in complete work and add reason in discusssion group
Rate user work in this
What admin sees and what user sees

user side task assigned to him
Will be cards of tasks and clicking upon task
will have details about task
Assignee, reported, due date, task header and details 
Under that will have chat space for discussion of task
When Click on Submit task Open modal and add dropzone there for accepting files
*/
