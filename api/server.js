const express = require("express");
const { google } = require("googleapis");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Para receber JSON no body das requisições

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    credentials: CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth.getClient();
}

// Rota GET para ler dados da planilha
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

// Rota POST para escrever na planilha
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
      range: "A2",
      valueInputOption: "RAW",
      resource: { values },
    });

    res.json({ message: "Dados escritos com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
