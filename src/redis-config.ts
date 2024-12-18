import Redis from 'ioredis';

import { config } from './config';

// const redis = new Redis({
//   host: config.REDIS_URL,
//   port: 6379, // default Redis port
// });

const redis = new Redis(config.REDIS_URL); 

export default redis;
