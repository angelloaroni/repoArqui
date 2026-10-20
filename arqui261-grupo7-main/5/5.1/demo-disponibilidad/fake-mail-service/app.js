const express = require("express");

const app = express();

app.use(express.json());

let attempts = 0;

/*simula intentos ,el primero falla pero los siguientes tiene exito*/
app.post("/send-mail", (req, res) => {
  attempts++;

  console.log(`Mail request #${attempts}`);

  if (attempts === 1) {
    console.log("Simulating temporary failure");

    return res.status(500).json({
      success: false,
      message: "Mail service unavailable",
    });
  }

  console.log("Mail sent successfully");

  return res.status(200).json({
    success: true,
    message: "Mail sent",
  });
});

/*
 * Reinicia el contador para poder volver a demostrar Retry
 */
app.post("/reset", (req, res) => {
  attempts = 0;

  console.log("Mail service counter reset");

  return res.status(200).json({
    success: true,
    message: "Counter reset",
  });
});

app.listen(3001, () => {
  console.log("Fake Mail Service running on port 3001");
});