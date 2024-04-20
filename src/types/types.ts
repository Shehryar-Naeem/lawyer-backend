import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import mongoose, { Document, ObjectId, Types,Model } from "mongoose";

type avatar = {
  public_id: string;
  url: string;
};
export interface IRoles {
  _id: mongoose.Types.ObjectId;
  roleType: "client" | "lawyer" | "admin";
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  city?: string;
  avatar: avatar;
  postalCode?: number;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
  yourSelf?: string;
  roles: IRoles[];
  gender: "male" | "female";
  getJWTToken: () => string;
  comparePassword: (password: string) => Promise<boolean>;
  getResetPasswordToken: () => string;
}
export interface ILawyer {
  user: ObjectId;
  phoneNumber: number;
  yourSelf: string;
  services: string[];
  gigs: mongoose.Types.ObjectId[];
  numOfReviews: number;
  professionalInfo: {
    lawFirmName: string;
    title: string;
    barAdmission: {
      state: string;
      licenseNumber: string;
    };
    experience: string;
  };

  isVerified: boolean;
  availability: {
    // officeHours: string;
    days: string[];
  };
  education: {
    completionYear: {
      startYear: number;
      endYear: number;
    };
    institution: string;
    degreeName: string;
  };
}
export interface IClient {
  user: ObjectId;
  phone: number;
  yourSelf: string;
  address: string;
  documents: avatar[];
  gender: "male" | "female";
  cnic: number;
  age: number;
}
export interface IRole {
  roleName: "client" | "lawyer" | "admin";
}
export interface NewUserRequestBody {
  name: string;
  email: string;
  password: string;
  role?: "user" | "lawyer" | "admin";
}
export type ControllerFunc = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type CombinedType = Document<unknown, {}, IUser> &
  IUser & {
    _id: Types.ObjectId;
  };

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}
export interface IUpdateUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: "client" | "lawyer" | "admin";
  avatar?: avatar;
}

export interface updateAuthenticatedRequest extends Request {
  user?: IUpdateUser | null;
}

export interface DecodedJwtPayload extends JwtPayload {
  id: string;
}

export interface IUpdateAuthenticatedLawyerRequest extends Request {
  user?: IUser | null;
}
export interface IEducation {
  // Other properties...
  education: {
    completionYear: Date;
    institution: string;
  };
}



interface IGig extends Document {
  title: string;
  description: string;
  pricing: {
    services: string[];
    price: number;
    additionalCost?: {
      services: string[];
      price: number;
    };
  };
  images: Array<{
    public_id: string;
    url: string;
  }>;
  category: string[];
  reviews: Array<{
    user: typeof mongoose.Schema.Types.ObjectId;
    name: string;
    rating: number;
    comment: string;
  }>;
  user: typeof mongoose.Schema.Types.ObjectId;
  lawyer: typeof mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Assuming you have already defined a mongoose schema for Gig somewhere


// Convert schema to TypeScript model type
export { IGig };
