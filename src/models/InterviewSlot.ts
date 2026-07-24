import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterviewSlot extends Document {
  adminEmail: string;
  panelName: string; // e.g. 'Panel 1', 'Panel 2', 'Panel 3'
  deptSlug: string; // 'all' or department slug (e.g. 'development')
  startTime: Date;
  endTime: Date;
  status: "available" | "booked" | "completed" | "cancelled";
  locationType: "offline" | "online";
  locationDetails: string; // Room location or Online format details
  bookedBy?: {
    userId: string;
    userEmail: string;
    userName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSlotSchema = new Schema<IInterviewSlot>(
  {
    adminEmail: { type: String, required: true },
    panelName: { type: String, default: "Panel 1" },
    deptSlug: { type: String, required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["available", "booked", "completed", "cancelled"],
      default: "available",
      index: true,
    },
    locationType: {
      type: String,
      enum: ["offline", "online"],
      required: true,
    },
    locationDetails: { type: String, required: true },
    bookedBy: {
      userId: { type: String },
      userEmail: { type: String },
      userName: { type: String },
    },
  },
  { timestamps: true }
);

// Compound index allowing parallel panels for the same adminEmail and startTime
InterviewSlotSchema.index({ adminEmail: 1, startTime: 1, panelName: 1 }, { unique: true });

const InterviewSlot: Model<IInterviewSlot> =
  mongoose.models.InterviewSlot ||
  mongoose.model<IInterviewSlot>("InterviewSlot", InterviewSlotSchema);

export default InterviewSlot;
