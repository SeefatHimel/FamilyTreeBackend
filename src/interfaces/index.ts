import { Document } from "mongoose";

export interface FamilyListInterface extends Document {
  id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  creator?: string;
  originMember?: string | null;
  users?: string[];
  viewers?: string[];
  hash?: string;
  salt?: string;
  setPassword?: (password: string) => void;
  validPassword?: (password: string) => boolean;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
}
