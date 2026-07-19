export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { profile, macros, targetCalories } = req.body;
    
    if (!profile || !macros) {
      return res.status(400).json({ error: 'Missing profile or macros data' });
    }

    const apiKey = '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';
    const model = 'meta/llama-3.1-8b-instruct';

    const prompt = `You are a world-class sports nutritionist specializing in Indian cuisine.
Create a perfectly balanced 1-day diet plan for an Indian individual based on these targets:
- Goal: ${profile.goal}
- Target Calories: ${targetCalories} kcal
- Target Macros: ${macros.p}g Protein, ${macros.c}g Carbs, ${macros.f}g Fat
- Diet preference: Indian Cuisine (Use real foods like Dal, Paneer, Chicken Tikka, Roti, Rice, Chana, etc. matching their gender/goal).

Generate EXACTLY 5 meals: Breakfast, Lunch, Pre-Workout, Post-Workout, Dinner.
Distribute the macros logically across these meals.
For each meal, provide:
- mealName (e.g. "Breakfast")
- foods: a short descriptive string of the meal (e.g. "3 Egg Bhurji with 2 Roti and 1 bowl Curd")
- macros: p (protein in g), c (carbs in g), f (fat in g), cals (calories)

You MUST respond with a VALID JSON object in exactly this format, and absolutely nothing else (no markdown formatting, no code blocks, just raw JSON).
{
  "total": { "cals": 0, "p": 0, "c": 0, "f": 0 },
  "meals": [
    {
      "mealName": "Breakfast",
      "foods": "Description of food",
      "macros": { "p": 0, "c": 0, "f": 0, "cals": 0 }
    }
  ]
}`;

    const requestBody = {
      model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 1024,
      temperature: 0.2,
      top_p: 0.7,
      response_format: { type: 'json_object' }
    };

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `NVIDIA API Error: ${errText}` });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    // Clean JSON markdown just in case the model ignores response_format
    content = content.trim();
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      content = codeBlockMatch[1].trim();
    }
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({ error: `AI returned invalid format: ${content.substring(0, 100)}` });
    }

    return res.status(200).json({ status: 'success', data: parsedResult });

  } catch (err) {
    console.error('Vercel API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
