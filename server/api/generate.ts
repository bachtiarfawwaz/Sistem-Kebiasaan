import { defineEventHandler, readBody, createError } from "h3";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const apiUrl = "https://qwen-api.maqwa.com";
  const apiKey = "1J74AN2AjGSOYKxwAu8bt4aWlgBfNrrT";
  const model = body.model || "Qwen3.5-9B-heretic-v2.Q4_K_M.gguf";
  const prompt = body.prompt;

  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: "Prompt is required",
    });
  }

  const config = useRuntimeConfig();
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
  );
  const { data: faqs, error: faqError } = await supabase
    .from("bot_faqs")
    .select("pertanyaan, jawaban");

  let faqContext = "";
  if (faqs && faqs.length > 0) {
    faqContext = "\n\nBerikut adalah Basis Pengetahuan (FAQ) sistem:\n";
    faqContext += faqs
      .map((f) => `Q: ${f.pertanyaan}\nA: ${f.jawaban}`)
      .join("\n\n");
  }

  let systemMessage =
    body.system ||
    `Anda adalah Asisten AI untuk aplikasi KAIH (Karakter Anak Indonesia Hebat). 
Tugas utama Anda HANYA menjawab pertanyaan pengguna secara spesifik, ringkas, dan ramah berdasarkan "Basis Pengetahuan" yang diberikan di bawah ini.

ATURAN SANGAT KETAT:
1. DILARANG KERAS membuat daftar, merangkum, atau membacakan seluruh isi Basis Pengetahuan.
2. Jawab HANYA bagian yang ditanyakan oleh pengguna. Jika pengguna bertanya soal A, jawab soal A saja.
3. Jangan pernah memberikan alasan, manfaat, dampak, atau informasi tambahan lainnya jika tidak ditanyakan secara spesifik. (Contoh: Jika ditanya "Jam berapa?", cukup jawab jamnya saja, tanpa menjelaskan tujuannya).
4. Jika pertanyaan pengguna TIDAK ADA kaitannya dengan Basis Pengetahuan, jawab dengan: "Maaf Ayah/Bunda, saya hanya bisa menjawab pertanyaan seputar penggunaan aplikasi KAIH."`;

  systemMessage += faqContext;

  try {
    const response: any = await $fetch(`${apiUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: {
        model: model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        stream: false,
      },
    });

    // Map OpenAI format back to what the frontend expects
    let reply = response.choices?.[0]?.message?.content || "";

    reply = reply.replace(/<think>[\s\S]*?<\/think>\n?/g, ""); // Hapus blok <think>...</think>
    reply = reply.replace(/\*\*(.*?)\*\*/g, "$1"); // Hapus ** di sekitar teks tebal
    reply = reply.replace(/\*\*/g, ""); // Hapus sisa **
    reply = reply.replace(/#{1,6}\s?/g, ""); // Hapus tanda # untuk heading
    reply = reply.replace(/__(.*?)__/g, "$1"); // Hapus __
    reply = reply.replace(/\*(.*?)\*/g, "$1"); // Hapus * untuk miring

    return { response: reply.trim() };
  } catch (error: any) {
    console.error("Error connecting to AI:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Gagal terhubung ke AI. Pastikan server aktif dan model "${model}" tersedia.`,
      data: error.message,
    });
  }
});
