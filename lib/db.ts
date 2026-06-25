import mongoose, { Mongoose } from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

interface MongooseConn {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConn = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null,
    };
}

export const connect = async () => {
    if (!MONGO_URL) {
        throw new Error("MONGO_URL environment variable is missing inside .env.local");
    }

    if (cached.conn) return cached.conn;

    cached.promise =
        cached.promise ||
        mongoose.connect(MONGO_URL, {
            dbName: "mic-rec",
            bufferCommands: true,
            connectTimeoutMS: 30000,
        });

    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected successfully");
    return cached.conn;
};
