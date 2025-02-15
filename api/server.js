const express = require("express");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const cors = require("cors"); // Importação do middleware de CORS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Habilita CORS para todas as origens
app.use(express.json()); // Para receber JSON no body das requisições

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);

// Definindo a configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Google Sheets",
      version: "1.0.0",
      description:
        "API para ler e escrever dados em uma planilha do Google Sheets",
    },
  },
  apis: ["./api/server.js"], // O caminho para o arquivo com as rotas
};

// Gerando a especificação Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Rota do Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    credentials: CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth.getClient();
}

/**
 * @swagger
 * /read:
 *   get:
 *     summary: "Ler dados de uma planilha do Google Sheets"
 *     responses:
 *       200:
 *         description: "Dados lidos com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: string
 *       500:
 *         description: "Erro ao ler os dados"
 */
app.get("/", async (req, res) => {
  try {
    res.send(`
      <h1>API em Funcionamento!</h1>
      <a href="/api-docs">Swagger</a>
      `);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/read", async (req, res) => {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "A1:D10", // Altere para o intervalo desejado
    });

    res.json({ data: response.data.values });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /write:
 *   post:
 *     summary: "Escrever dados em uma planilha do Google Sheets"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               values:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: string
 *     responses:
 *       200:
 *         description: "Dados escritos com sucesso"
 *       400:
 *         description: "Erro no corpo da requisição"
 *       500:
 *         description: "Erro ao escrever os dados"
 */
app.post("/write", async (req, res) => {
  try {
    const { values } = req.body; // Exemplo: { "values": [["Dado1", "Dado2"]] }

    if (!values || !Array.isArray(values)) {
      return res.status(400).json({
        error: "O corpo da requisição deve conter um array chamado 'values'",
      });
    }

    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "A1",
      valueInputOption: "RAW",
      resource: { values },
    });

    res.json({ message: "Dados escritos com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/clear", async (req, res) => {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: "A:D", // Limpa todas as colunas usadas
    });

    res.json({ message: "Planilha limpa com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
