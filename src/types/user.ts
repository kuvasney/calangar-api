export interface IUser {
  email: string;
  name: string;
  password?: string | null;
  avatar?: string | null;
  googleId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
