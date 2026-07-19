const apiKey = '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';
const model = 'microsoft/phi-3-vision-128k-instruct';
// A tiny 1x1 white pixel base64 image
const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

const prompt = `You are an expert food nutritionist AI. Analyze this food image.

Identify ALL food items. For each:
- name, emoji, estimatedGrams, confidence (75-99), category (grains/protein/vegetables/fruits/dairy/snacks/beverages/combo)
- nutrition for that serving: calories, protein, carbs, fat, fiber, sugar, sodium (mg), cholesterol (mg)
- per100g: same values per 100g

Classify mealType: high-protein, balanced, high-carb, light-snack, heavy-meal, low-fat, high-fiber
Give a 1-sentence healthNote.

Use REAL USDA data. Be conservative with portions.
If no food visible, return {"foods":[],"error":"No food detected"}

Respond ONLY with valid JSON (NO markdown backticks, NO extra text):`;

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

console.time('API Call');
fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify(requestBody)
}).then(res => {
  console.timeEnd('API Call');
  console.log('Status:', res.status);
  return res.json();
}).then(data => {
  console.log('Response:', JSON.stringify(data).substring(0, 500));
}).catch(err => {
  console.error('Error:', err);
});
