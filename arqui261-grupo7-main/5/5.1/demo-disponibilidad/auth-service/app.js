const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 segundos

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.post("/recover-password", async (req, res) => {

  const startTime = Date.now();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

    try {

      console.log(`Attempt ${attempt}`);

      const response = await axios.post(
        "http://fake-mail-service:3001/send-mail"
      );

      const recoveryTime = Date.now() - startTime;

      console.log("Mail sent successfully");
      console.log(`Recovery time: ${recoveryTime} ms`);

      return res.status(200).json({
        success: true,
        attempts: attempt,
        recoveryTimeMs: recoveryTime,
        response: response.data,
      });

    } catch (error) {

      console.log(`Attempt ${attempt} failed`);

      if (attempt === MAX_RETRIES) {

        const recoveryTime = Date.now() - startTime;

        return res.status(500).json({
          success: false,
          attempts: attempt,
          recoveryTimeMs: recoveryTime,
          message: "Maximum retries reached",
        });

      }

      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...\n`);

      await sleep(RETRY_DELAY);
    }
  }
});

app.listen(3000, () => {
  console.log("Auth Service running on port 3000");
});