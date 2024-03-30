import mongoose from "mongoose";
import { IRole, IUser } from "../../types/types.js";

const roleSchema = new mongoose.Schema<IRole>({
  roleName: { type: String, required: true },
});

const userRolesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
});

const Role = mongoose.model<IRole>("Role", roleSchema);

export { Role,userRolesSchema };
