export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, mimeType } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const apiKey = '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';
    const model = 'meta/llama-3.2-11b-vision-instruct';
    const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${image}`;

    const prompt = `You are an expert food nutritionist AI. Analyze this food image.

Identify ALL food items. For each:
- name, emoji, estimatedGrams, confidence (75-99), category (grains/protein/vegetables/fruits/dairy/snacks/beverages/combo)
- nutrition for that serving: calories, protein, carbs, fat, fiber, sugar, sodium (mg), cholesterol (mg)
- per100g: same values per 100g

Classify mealType: high-protein, balanced, high-carb, light-snack, heavy-meal, low-fat, high-fiber
Give a 1-sentence healthNote.

Use REAL USDA data. Be conservative with portions.
If no food visible, return {"foods":[],"error":"No food detected"}

Respond ONLY with valid JSON (NO markdown backticks, NO extra text):
{"foods":[{"name":"Grilled Chicken Breast","emoji":"🍗","estimatedGrams":150,"confidence":95,"category":"protein","nutrition":{"calories":248,"protein":46.5,"carbs":0,"fat":5.4,"fiber":0,"sugar":0,"sodium":85,"cholesterol":120},"per100g":{"calories":165,"protein":31,"carbs":0,"fat":3.6,"fiber":0,"sugar":0,"sodium":57,"cholesterol":80}}],"totalCalories":0,"totalProtein":0,"totalCarbs":0,"totalFat":0,"totalFiber":0,"totalSugar":0,"mealType":"balanced","healthNote":"Good protein."}`;

    const requestBody = {
      model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }],
      max_tokens: 1024,
      temperature: 0.2,
      top_p: 0.7
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
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return res.status(500).json({ error: 'No response from NVIDIA AI' });
    }

    // Clean JSON markdown
    let jsonStr = content.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonStr);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Calculate totals
    if (!parsedResult.totalCalories && parsedResult.foods && parsedResult.foods.length > 0) {
      parsedResult.totalCalories = 0; parsedResult.totalProtein = 0; parsedResult.totalCarbs = 0;
      parsedResult.totalFat = 0; parsedResult.totalFiber = 0; parsedResult.totalSugar = 0;
      parsedResult.foods.forEach(f => {
        const n = f.nutrition || {};
        parsedResult.totalCalories += n.calories || 0;
        parsedResult.totalProtein += n.protein || 0;
        parsedResult.totalCarbs += n.carbs || 0;
        parsedResult.totalFat += n.fat || 0;
        parsedResult.totalFiber += n.fiber || 0;
        parsedResult.totalSugar += n.sugar || 0;
      });
    }

    parsedResult.source = 'nvidia-nim-vercel';
    
    return res.status(200).json({ status: 'success', data: parsedResult });

  } catch (err) {
    console.error('Vercel API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
