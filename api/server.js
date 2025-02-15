import { createServer } from "http";

const port = 3000;

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    console.log("Acesso ao root");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <h1>Oi!</h1>
      <a href="./soma">Soma</a>
    `);
  } else if (req.method === "GET" && req.url === "/soma") {
    console.log("Acesso a soma");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <a href="../">Voltar</a>
      <p>Use esta url para enviar a soma de dois numeros via POST</p>
    `);
  } else if (req.method === "POST" && req.url === "/soma") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString(); // Acumula os dados recebidos
    });

    req.on("end", () => {
      try {
        const { num1, num2 } = JSON.parse(body);

        if (typeof num1 !== "number" || typeof num2 !== "number") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Os valores devem ser números" }));
          return;
        }

        const resultado = num1 + num2;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ resultado }));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Erro ao processar JSON" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Rota não encontrada");
  }
});

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
