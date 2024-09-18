import request from 'supertest';
import app from '../src/app';

describe('Authentication API', () => {
  it('should sign up a new user', async () => {
    const response = await request(app)
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
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
