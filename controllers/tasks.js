const Joi = require("joi");
const Tasks = require("../models/Tasks");

const createTaskValidation = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  assignee: Joi.string().required(),
  reporter: Joi.string().required(),
  dueDate: Joi.date().required(),
});

// Notify assignee
exports.createTask = async (req, res) => {
  try {
    const validateRequest = createTaskValidation.validate(req.body);
    if (validateRequest.error) {
      console.log(validateRequest.error.details);
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
    if (req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Please Input Files For Submitting Task" });
    }
  } catch (error) {}
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
