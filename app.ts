import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import auth from './src/routes/auth'
import box from './src/routes/box'

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/box', box);


const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});


