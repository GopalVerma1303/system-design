import express from "express";

const app = express();

const PORT = process.env.PORT || 8000;

app.get("/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PONG",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
