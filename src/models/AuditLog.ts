import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  adminEmail: string;
  action: string;
  target: string;
  details?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    details: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
