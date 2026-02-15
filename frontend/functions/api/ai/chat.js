export async function onRequestPost({ request, env }) {
    const GEMINI_API_KEY = "AIzaSyCGkW-IwazOjwRNU5VL2fgs59kTzKkMM4w";
    const { message, username } = await request.json();

    const system_prompt = `You are a helpful AI Assistant for the portfolio of Miryam Abida. 
  Answer questions about her skills, experience, and projects. 
  Be polite, creative, and professional. 
  If you don't know something, say you'll pass it on to her.`;

    const models_to_try = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
    let ai_response = null;
    let last_error = null;

    for (const model of models_to_try) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            const payload = {
                system_instruction: { parts: [{ text: system_prompt }] },
                contents: [{ role: "user", parts: [{ text: message }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            };

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.candidates && result.candidates[0] && result.candidates[0].content) {
                ai_response = result.candidates[0].content.parts[0].text;
                break;
            } else {
                last_error = result.error ? result.error.message : "No candidate found";
            }
        } catch (e) {
            last_error = e.message;
        }
    }

    if (!ai_response) {
        return new Response(JSON.stringify({
            response: "Maaf, saya sedang mengalami kendala teknis (Proxy). " + last_error,
            success: false
        }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ response: ai_response, success: true }), {
        headers: { "Content-Type": "application/json" }
    });
}
