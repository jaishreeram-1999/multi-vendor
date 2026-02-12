import mongoose, { Schema, type Document } from "mongoose"

// User Interface
interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  role: "admin" | "vendor"|"user"
  createdAt: Date
  updatedAt: Date
  
}


const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "vendor","user"], default: "user" },
  },
  { timestamps: true },
)

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)