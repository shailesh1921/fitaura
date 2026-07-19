const apiKey = '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';
const model = 'meta/llama-3.1-8b-instruct';
const prompt = `You are a world-class sports nutritionist specializing in Indian cuisine.
Create a perfectly balanced 1-day diet plan for an Indian individual based on these targets:
- Goal: fat_loss
- Target Calories: 1800 kcal
- Target Macros: 150g Protein, 180g Carbs, 50g Fat
- Diet preference: Indian Cuisine (Use real foods like Dal, Paneer, Chicken Tikka, Roti, Rice, Chana, etc. matching their gender/goal).

Generate EXACTLY 5 meals: Breakfast, Lunch, Pre-Workout, Post-Workout, Dinner.
Distribute the macros logically across these meals.
For each meal, provide:
- mealName (e.g. "Breakfast")
- foods: a short descriptive string of the meal (e.g. "3 Egg Bhurji with 2 Roti and 1 bowl Curd")
- macros: p (protein in g), c (carbs in g), f (fat in g), cals (calories)

You MUST respond with a VALID JSON object in exactly this format, and absolutely nothing else:
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

fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
    temperature: 0.2,
    response_format: { type: 'json_object' }
  })
}).then(res => res.json()).then(console.log).catch(console.error);
