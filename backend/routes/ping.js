import { Router } from "express";

const pingRouter = Router();

pingRouter.get('/ping', (req, res) => {
    res.status(200).set('Content-Type', 'text/plain').send('pong').end();
});

export default pingRouter;