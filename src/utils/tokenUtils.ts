import crypto from 'crypto';

export const generateResetToken = (): string => {
  return crypto.randomBytes(20).toString('hex');
};
