import express from "express"
import cors from "cors"
import path from "path"
import dotenv from "dotenv"
import { fileURLToPath } from "url"
import { processarCard } from "./calculos.js"
import { getCard, atualizarCard } from "./pipefyService.js"

dotenv.config()

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())
app.use(express.json())

// 🔥 SERVIR FRONT
app.use(express.static(path.join(__dirname, "../public")))

// 🔥 ROTA ROOT
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"))
})

console.log("Iniciando servidor...")
console.log("TOKEN:", process.env.PIPEFY_TOKEN)

// 🔹 TESTE
app.get("/teste", (req, res) => {
  res.send("Servidor OK")
})

// 🔹 CARD
app.get("/card/:id", async (req, res) => {
  try {
    const rawId = req.params.id
    const cardId = rawId.replace(/[{}]/g, "")

    console.log("Buscando card:", cardId)

    const card = await getCard(cardId)

    if (!card) {
      return res.status(404).json({ erro: "Card não encontrado" })
    }

    res.json(card)

  } catch (err) {
    console.error("Erro ao buscar card:", err)
    res.status(500).json({ erro: err.message })
  }
})

// 🔹 PROCESSAR
app.post("/processar", async (req, res) => {
  try {
    const { cardId, inputs } = req.body

    if (!cardId) {
      return res.status(400).json({ erro: "cardId obrigatório" })
    }

    const resultado = await processarCard(cardId, inputs || {})
    res.json(resultado)

  } catch (err) {
    console.error("Erro ao processar:", err)
    res.status(500).json({ erro: "Erro interno" })
  }
})

// 🔹 SALVAR
app.post("/salvar", async (req, res) => {
  try {
    const { cardId, dados } = req.body

    console.log("📥 RECEBIDO:", cardId)
    console.log("📊 DADOS:", dados)

    const card = await getCard(cardId)
    const nodeId = card.id

    const resultado = await atualizarCard(nodeId, dados)

    res.json({
      sucesso: true,
      resultado
    })

  } catch (err) {
    console.error("❌ ERRO:", err.message)

    res.status(500).json({
      erro: err.message
    })
  }
})

// 🔥 PORTA DINÂMICA (ESSENCIAL)
const PORT = process.env.PORT || 4000

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor rodando na porta:", PORT)
})