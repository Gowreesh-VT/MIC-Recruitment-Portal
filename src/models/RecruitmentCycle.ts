import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecruitmentCycle extends Document {
  cycleId: string;
  isOpen: boolean;
  openedAt: Date;
  closedAt?: Date;
  label: string;
  startAt?: Date;
  endAt?: Date;
  countdownEnabled?: boolean;
  countdownTarget?: Date;
  countdownTitle?: string;
}

const RecruitmentCycleSchema = new Schema<IRecruitmentCycle>(
  {
    cycleId: { type: String, required: true, unique: true },
    isOpen: { type: Boolean, default: false },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    label: { type: String, default: "MIC Recruitment 2026–27" },
    startAt: { type: Date },
    endAt: { type: Date },
    countdownEnabled: { type: Boolean, default: false },
    countdownTarget: { type: Date },
    countdownTitle: { type: String, default: "Recruitment Countdown" },
  },
  { timestamps: true }
);

const RecruitmentCycle: Model<IRecruitmentCycle> =
  mongoose.models.RecruitmentCycle ||
  mongoose.model<IRecruitmentCycle>("RecruitmentCycle", RecruitmentCycleSchema);

export default RecruitmentCycle;
