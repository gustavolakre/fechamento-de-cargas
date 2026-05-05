import { getCard, atualizarCampos } from "./pipefyService.js"

// 🔹 MAPEIE AQUI COM OS FIELD_ID REAIS
const CAMPOS = {
  // 🔹 ENTRADA (Pipefy)
  quantidade: "quantidade",
  peso: "peso",
  preco: "pre_o_kg",

  // 🔹 SAÍDA (Pipefy)
  mortos: "mortos_em_transporte",
  condTotais: "condena_es_totais",
  condParciais: "condena_es_parciais",
  embutido: "embutido_cozido",
  valorBruto: "valor_total_bruto",
  valorMortos: "condena_es",
  valorCondenacoes: "valor_condena_es",
  outrosDescontos: "outros_descontos",
  senar: "senar_funrural",
  valorLiquido: "valor_total_l_quido"
}

function getValor(card, fieldId) {
  const f = card.fields.find(f => f.field.id === fieldId)
  return Number(f?.value || 0)
}

export async function processarCard(cardId, inputs) {

  const card = await getCard(cardId)

  const peso = getValor(card, CAMPOS.peso)
  const quantidade = getValor(card, CAMPOS.quantidade)
  const preco = getValor(card, CAMPOS.preco)

  // 🔹 INPUT DO USUÁRIO
  const taxaSenar = Number(inputs.senar || 0)

  // 🔹 CÁLCULOS (vamos evoluir depois)
  const valorBruto = peso * preco
  const valorSenar = valorBruto * (taxaSenar / 100)
  const valorLiquido = valorBruto - valorSenar

  const resultado = {
    [CAMPOS.mortos]: 0,
    [CAMPOS.condTotais]: 0,
    [CAMPOS.condParciais]: 0,
    [CAMPOS.embutido]: 0,
    [CAMPOS.senar]: valorSenar.toFixed(2),
    [CAMPOS.valorLiquido]: valorLiquido.toFixed(2)
  }

  await atualizarCampos(cardId, resultado)

  return {
    entrada: { peso, quantidade, preco },
    saida: resultado
  }
}