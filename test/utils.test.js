"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passwordUtils_1 = require("../src/utils/passwordUtils");
describe('Password Utils', () => {
    const plainPassword = 'password123';
    const hashedPassword = (0, passwordUtils_1.hashPassword)(plainPassword);
    it('should hash a password', () => {
        expect(hashedPassword).not.toEqual(plainPassword);
    });
    it('should verify a password', () => {
        const isValid = (0, passwordUtils_1.verifyPassword)(plainPassword, hashedPassword);
        expect(isValid).toBe(true);
    });
});
