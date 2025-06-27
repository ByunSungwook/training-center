import { env } from '@/env.js';
import { MongoClient } from 'mongodb';

export const mongodb = new MongoClient(env.MONGODB_CONNECTION_STRING);
