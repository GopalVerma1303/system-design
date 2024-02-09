import { CronJob } from "cron";
import express from "express";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3001;

const RATE_LIMIT = 5;

const tokenBucket = [];

const refillBucket = () => {
  if (tokenBucket.length < RATE_LIMIT) {
    tokenBucket.push(Date.now());
  }
};

app.get("/bucket", (req, res) => {
  res.json({
    bucketLimit: RATE_LIMIT,
    currentBucketSize: tokenBucket.length,
    bucket: tokenBucket,
  });
});

const rateLimitMiddleware = (req, res, next) => {
  if (tokenBucket.length > 0) {
    const token = tokenBucket.shift();
    console.log(`token ${token} is consumed`);
    res.set("X-RateLimit-Remaining", tokenBucket.length);
    next();
  } else {
    res.status(429).set("X-RateLimit-Remaining", 0).set("Retry-After", 2).json({
      success: false,
      message: "Too many requests",
    });
  }
};

app.use(rateLimitMiddleware);

app.get("/test", (req, res) => {
  const ROCK_PAPER_SCISSORS = ["rock 🪨", "paper 📃", "scissors ✂️"];

  const randomIndex = Math.floor(Math.random() * 3);
  const randomChoice = ROCK_PAPER_SCISSORS[randomIndex];

  res.json({
    success: true,
    message: `You got ${randomChoice}`,
  });
});

const job = new CronJob("*/2 * * * * *", () => {
  refillBucket();
});

app.listen(PORT, () => {
  console.log(`Server for Tocken Bucket Algorithm is running on port ${PORT}`);
  job.start();
});
