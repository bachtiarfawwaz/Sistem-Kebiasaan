import { defineEventHandler, readBody, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const apiUrl = 'https://qwen-api.maqwa.com'
  const apiKey = '1J74AN2AjGSOYKxwAu8bt4aWlgBfNrrT'
  const model = body.model || 'Qwen3.5-9B-heretic-v2.Q4_K_M.gguf'
  const prompt = body.prompt

  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required'
    })
  }

  // Ambil FAQ dari database
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
  const { data: faqs, error: faqError } = await supabase.from('bot_faqs').select('pertanyaan, jawaban')

  let faqContext = ''
  if (faqs && faqs.length > 0) {
    faqContext = '\n\nBerikut adalah Basis Pengetahuan (FAQ) sistem:\n'
    faqContext += faqs.map(f => `Q: ${f.pertanyaan}\nA: ${f.jawaban}`).join('\n\n')
  }

  let systemMessage = body.system || "Anda adalah Asisten KAIH (Karakter Anak Indonesia Hebat). Anda akan diberikan Basis Pengetahuan (FAQ). Tugas utama Anda adalah menjawab pertanyaan orang tua dengan ramah dan ringkas BERSANDARKAN pada Basis Pengetahuan tersebut. PENTING: Jawablah secara spesifik HANYA apa yang ditanyakan pengguna berdasarkan FAQ. Jika ditanya tentang 'waktu', cukup jawab tentang waktu tanpa menjelaskan manfaat atau dampak kecuali diminta. Jangan memberikan informasi panjang lebar yang tidak relevan dengan inti pertanyaan."

  // Tambahkan konteks FAQ ke system prompt
  systemMessage += faqContext

  try {
    const response: any = await $fetch(`${apiUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        stream: false
      }
    })

    // Map OpenAI format back to what the frontend expects
    let reply = response.choices?.[0]?.message?.content || ''

    // Hapus format Markdown seperti ** dan # agar terlihat rapi sebagai plain text
    reply = reply.replace(/\*\*(.*?)\*\*/g, '$1') // Hapus ** di sekitar teks tebal
    reply = reply.replace(/\*\*/g, '') // Hapus sisa **
    reply = reply.replace(/#{1,6}\s?/g, '') // Hapus tanda # untuk heading
    reply = reply.replace(/__(.*?)__/g, '$1') // Hapus __
    reply = reply.replace(/\*(.*?)\*/g, '$1') // Hapus * untuk miring

    return { response: reply }
  } catch (error: any) {
    console.error('Error connecting to AI:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Gagal terhubung ke AI. Pastikan server aktif dan model "${model}" tersedia.`,
      data: error.message
    })
  }
})
