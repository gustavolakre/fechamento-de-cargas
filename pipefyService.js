import fetch from "node-fetch"

const URL = "https://api.pipefy.com/graphql"

const TOKEN = process.env.PIPEFY_TOKEN

export async function getCard(cardId) {

  const query = `
    query {
      card(id: ${cardId}) {
        id
        fields {
          field { id label }
          value
        }
      }
    }
  `

  const response = await fetch("https://api.pipefy.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.PIPEFY_TOKEN}`
    },
    body: JSON.stringify({ query })
  })

  const data = await response.json()

  console.log("📥 RESPOSTA DO PIPEFY:", JSON.stringify(data, null, 2))

  if (data.errors) {
    throw new Error(JSON.stringify(data.errors))
  }

  if (!data.data || !data.data.card) {
    throw new Error("Card não encontrado")
  }

  return data.data.card
}

function formatarMoedaPipefy(valor) {
  return Number(valor || 0).toFixed(2)
}


export async function atualizarCampos(cardId, fields) {

  const fieldsString = Object.entries(fields).map(([fieldId, value]) => {
    return `{
      field_id: "${fieldId}",
      field_value: "${value}"
    }`
  }).join(",")

  const mutation = `
    mutation {
      updateCardFields(input: {
        card_id: ${cardId},
        fields_attributes: [${fieldsString}]
      }) {
        card { id }
      }
    }
  `

  await fetch(URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: mutation })
  })
}


export async function atualizarCard(cardId, dados) {

  function formatarMoedaPipefy(valor) {
    return Number(valor || 0).toFixed(2)
  }

  const toNumber = (v) => Number(v || 0)

  const totalCondenacoes = toNumber(dados.totalCondenacoes)

  const campos = [
    { id: "valor_total_bruto", value: formatarMoedaPipefy(dados.valorBruto) },
    { id: "valor_total_l_quido", value: formatarMoedaPipefy(dados.valorLiquido) },
    { id: "senar_funrural", value: formatarMoedaPipefy(dados.funrural) },
    { id: "outros_descontos", value: formatarMoedaPipefy(dados.outros) },

    { id: "valor_condena_es", value: formatarMoedaPipefy(totalCondenacoes) },

    { id: "condena_es", value: formatarMoedaPipefy(dados.mortosTransporte) },

    { id: "mortos_em_transporte", value: String(dados.mortos || 0) },
    { id: "condena_es_parciais", value: String(dados.parciais || 0) },
    { id: "condena_es_totais", value: String(dados.totais || 0) },
    { id: "embutido_cozido", value: String(dados.embutido || 0) }
  ]

  const mutation = `
    mutation {
      updateFieldsValues(input: {
        nodeId: "${cardId}",
        values: [
          ${campos.map(c => `
            { fieldId: "${c.id}", value: "${c.value}" }
          `).join(",")}
        ]
      }) {
        success
      }
    }
  `

  const res = await fetch("https://api.pipefy.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PIPEFY_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: mutation })
  })

  const json = await res.json()

  console.log("📤 ENVIO:", campos)
  console.log("📥 RESPOSTA:", JSON.stringify(json, null, 2))

  if (!json.data?.updateFieldsValues?.success) {
    throw new Error("Erro ao atualizar Pipefy")
  }

  return json
}