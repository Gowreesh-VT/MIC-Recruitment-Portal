import { dbConnect } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";

export async function logAdminAction(
  adminEmail: string,
  action: string,
  target: string,
  details?: string
) {
  try {
    await dbConnect();
    await AuditLog.create({
      adminEmail,
      action,
      target,
      details,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
