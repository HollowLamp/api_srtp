import express from 'express';
import cors from 'cors';
import router from './routes.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
