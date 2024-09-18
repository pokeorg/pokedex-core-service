// src/utils/passwordUtils.ts

import bcrypt from 'bcrypt';

// Hash the password
export const hashPassword = (password: string): string => {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
};

// Verify the password
export const verifyPassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};
