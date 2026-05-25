import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../firebase.js', () => {
  const mockFirestore = {
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ empty: true, docs: [], forEach: vi.fn() }),
      })),
      doc: vi.fn(() => ({
        set: vi.fn().mockResolvedValue(),
      })),
    })),
  };
  return { db: mockFirestore, auth: { createUser: vi.fn().mockResolvedValue({ uid: 'test-uid' }), getUserByEmail: vi.fn().mockRejectedValue(new Error('not found')) } };
});

import authRoutes from '../routes/auth.js';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/', authRoutes);
  return app;
};

describe('POST /register', () => {
  it('rechaza si faltan campos', async () => {
    const app = buildApp();
    const res = await request(app).post('/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Todos los campos son obligatorios');
  });

  it('rechaza username menor a 3 caracteres', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/register')
      .send({ username: 'ab', email: 'a@b.com', password: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El usuario debe tener al menos 3 caracteres');
  });

  it('rechaza email inválido', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/register')
      .send({ username: 'test', email: 'invalido', password: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Correo electrónico no válido');
  });

  it('rechaza password menor a 6 caracteres', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/register')
      .send({ username: 'test', email: 'a@b.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('La contraseña debe tener al menos 6 caracteres');
  });
});

describe('POST /login', () => {
  it('rechaza si faltan campos', async () => {
    const app = buildApp();
    const res = await request(app).post('/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email o contraseña incorrectos');
  });
});
