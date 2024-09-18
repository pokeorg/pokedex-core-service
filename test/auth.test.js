"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
describe('Authentication API', () => {
    it('should sign up a new user', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/auth/signup')
            .send({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
    });
    it('should login an existing user', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/auth/login')
            .send({
            email: 'testuser@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });
});
