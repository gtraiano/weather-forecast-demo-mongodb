import express from 'express';
import routes from '../../routes/routes.js';
import request from 'supertest';

const app = express();
app.use(routes);
const api = request(app);

describe('routes integration', () => {
});