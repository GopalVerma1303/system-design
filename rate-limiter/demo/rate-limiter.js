// using fixed window algorithm for rate limiting

import redis from "ioredis";
import moment from "moment";

const redisclient = new redis({ url: "redis://localhost:6379" });

const rate_limit_duration = 10;
const allowed_request = 5;

const ratelimitmiddleware = async (req, res, next) => {
  const userid = req.headers["user_id"];
  const currenttime = moment().unix();
  const result = await redisclient.hgetall(userid);

  if (Object.keys(result).length === 0) {
    await redisclient.hmset(userid, "createdat", currenttime, "count", 1); // Changed hset to hmset
    return next();
  }

  if (result) {
    let diff = currenttime - result["createdat"];
    if (diff > rate_limit_duration) {
      await redisclient.hmset(userid, "createdat", currenttime, "count", 1); // Changed hset to hmset
      return next();
    }
  }

  if (parseInt(result["count"]) >= allowed_request) {
    return res.status(429).json({
      success: false,
      message: "rate-limit exceeded!",
    });
  } else {
    await redisclient.hincrby(userid, "count", 1); // Increment count by 1
    return next();
  }
};

export default ratelimitmiddleware;
