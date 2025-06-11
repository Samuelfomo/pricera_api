import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.send("API démarrée.");
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
