import express from "express";
const app = express();

// Rota raiz "/"
app.get("/", (req, res) => {
  res.send("Hello");
});

// Rota "/lista" retorna um JSON com uma lista vazia
app.get("/lista", (req, res) => {
  res.json([]);
});

// Inicia o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
