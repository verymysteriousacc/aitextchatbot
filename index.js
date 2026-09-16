export default {
	async fetch(request, env) {
		if (request.method !== "POST") {
			return new Response("Method Not Allowed", { status: 405 })
		}
		try {
			const body = await request.json()
			if (!body.message || typeof body.message !== "string") {
				return Response.json({ error: "Missing message" }, { status: 400 })
			}
			const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${env.AITOKEN}`
				},
				body: JSON.stringify({
					model: "nvidia/nemotron-3-ultra-550b-a55b:free",
					messages: [
						{
							role: "system",
							content: "You are a friendly AI chatbot for Roblox users. Keep every response at 50 characters or fewer. If your response would exceed 50 characters, summarize it. Keep conversations appropriate for Roblox users. You are ready to chat with Roblox users."
						},
						{
							role: "user",
							content: body.message
						}
					]
				})
			})
			const data = await response.json()
			if (!response.ok) {
				return Response.json({ error: "AI request failed" }, { status: response.status })
			}
			const reply = data?.choices?.[0]?.message?.content
			if (!reply) {
				return Response.json({ error: "No response from AI" }, { status: 500 })
			}
			return Response.json({
				reply: reply.trim().slice(0, 50)
			})
		} catch (error) {
			return Response.json({ error: "Request failed" }, { status: 500 })
		}
	}
}