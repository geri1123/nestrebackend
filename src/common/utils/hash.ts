import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};


export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex'); 
};


export const generatePublicCode = (): string => {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); 
};
