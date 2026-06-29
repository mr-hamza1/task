import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITask extends Document {
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema<ITask> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for the task"],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models.Task as Model<ITask>) || mongoose.model<ITask>("Task", TaskSchema);
