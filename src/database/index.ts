import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schemas/schema';
import { Pool } from 'pg'

const conectionString = process.env.DATABASE_URL as string;

const pool = new Pool({connectionString: conectionString});

export const db = drizzle(pool, {schema})

