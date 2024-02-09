// Using Fixed Window Algorithm for Rate Limiting

import Redis from "ioredis";
import moment from "moment";

const redisClient = new Redis({ url: "redis://localhost:6379" });
