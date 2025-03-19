import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import auth from './src/routes/auth'

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', auth);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
