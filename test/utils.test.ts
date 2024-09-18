import { hashPassword, verifyPassword } from '../src/utils/passwordUtils';

describe('Password Utils', () => {
  const plainPassword = 'password123';
  const hashedPassword = hashPassword(plainPassword);

  it('should hash a password', () => {
    expect(hashedPassword).not.toEqual(plainPassword);
  });

  it('should verify a password', () => {
    const isValid = verifyPassword(plainPassword, hashedPassword);
    expect(isValid).toBe(true);
  });
});
