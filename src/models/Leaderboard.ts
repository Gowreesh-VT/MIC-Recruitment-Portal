import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeaderboard extends Document {
  anonymousName: string;
  realName?: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeaderboardSchema = new Schema<ILeaderboard>(
  {
    anonymousName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50, // Publicly visible (e.g. "Anonymous Cyber Tiger")
    },
    realName: {
      type: String,
      trim: true,
      maxlength: 100, // Stored privately in DB (never sent to public API)
    },
    score: {
      type: Number,
      required: true,
      min: 21, // Enforces score strictly > 20
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast top score queries
LeaderboardSchema.index({ score: -1, createdAt: 1 });

const Leaderboard: Model<ILeaderboard> =
  mongoose.models.Leaderboard ||
  mongoose.model<ILeaderboard>("Leaderboard", LeaderboardSchema);

export default Leaderboard;
