const API_URL = 'https://api.openai.com/v1/chat/completions'
const grounding = `Ты — образовательный ассистент, работающий только с лекцией. Используй ИСКЛЮЧИТЕЛЬНО информацию из переданных фрагментов. Не добавляй внешние знания, не придумывай определения, примеры, варианты ответов или связи. Каждый элемент должен содержать точный ID фрагмента-источника. Если данных недостаточно, не создавай элемент. Сохраняй язык лекции.`
function parseJson(content) { try { return JSON.parse(content) } catch { const match = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/({[\s\S]*})/); if (!match) throw new Error('INVALID_JSON'); return JSON.parse(match[1]) } }
async function request(messages) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('NO_API_KEY')
  let response
  try { response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: 'gpt-4o-mini', messages, response_format: { type: 'json_object' }, temperature: 0.2 }) }) } catch { throw new Error('NETWORK') }
  if (!response.ok) { if (response.status === 429) throw new Error('RATE_LIMIT'); throw new Error('API_ERROR') }
  const data = await response.json()
  return parseJson(data.choices?.[0]?.message?.content || '')
}
export async function extractKnowledge(chunks) {
  const lecture = chunks.map(({ id, content }) => `[${id}]\n${content}`).join('\n\n')
  return request([{ role: 'system', content: grounding }, { role: 'user', content: `Извлеки проверяемое знание. Верни только JSON: {"facts":[{"text":"факт","sourceChunk":"ФРАГМЕНТ 1"}],"concepts":[{"term":"термин","definition":"определение","sourceChunk":"ФРАГМЕНТ 1"}],"themes":[{"text":"тема","sourceChunk":"ФРАГМЕНТ 1"}]}.\n\nЛЕКЦИЯ:\n${lecture}` }])
}
export async function generateMaterials(knowledge, chunks) {
  const sourceChunks = chunks.map(({ id, content }) => `[${id}]\n${content}`).join('\n\n')
  return request([{ role: 'system', content: grounding }, { role: 'user', content: `На основе извлечённого знания создай материалы. Перед созданием и для проверки КАЖДОГО элемента обязательно сверяйся с исходными фрагментами ниже. Используй только подтверждённую ими информацию; не добавляй внешние знания. sourceChunk каждого summary, keyPoint, quiz и flashcard должен быть ID реально подтверждающего исходного фрагмента. Если исходных фрагментов недостаточно, не создавай материал. Верни только JSON: {"summary":[{"title":"раздел","text":"краткое объяснение","sourceChunk":"ФРАГМЕНТ 1"}],"keyPoints":[{"text":"тезис","sourceChunk":"ФРАГМЕНТ 1"}],"quiz":[{"question":"вопрос","options":["вариант 1","вариант 2","вариант 3","вариант 4"],"answer":"вариант из options","sourceChunk":"ФРАГМЕНТ 1"}],"flashcards":[{"question":"термин или вопрос","answer":"ответ","sourceChunk":"ФРАГМЕНТ 1"}]}. Создай 4–6 тезисов, вопросов и 5–8 карточек только если поддержаны исходными фрагментами. Неверные варианты теста должны быть нейтральными, без новых фактов.\n\nИЗВЛЕЧЁННОЕ ЗНАНИЕ:\n${JSON.stringify(knowledge)}\n\nИСХОДНЫЕ ФРАГМЕНТЫ ДЛЯ ПРОВЕРКИ:\n${sourceChunks}` }])
}
