const fs = require('fs');

// .env.local 파일에서 GEMINI_API_KEY 읽기
const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/GEMINI_API_KEY="?([^"\n]+)"?/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
  console.error('GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('Testing API key:', apiKey.slice(0, 10) + '...' + apiKey.slice(-4));

async function testKey() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    if (data.models) {
      console.log('✅ SUCCESS: API key is valid!');
      console.log('Available models:', data.models.map(m => m.name).slice(0, 5).join('\n'));
    } else {
      console.log('❌ ERROR:', JSON.stringify(data.error, null, 2));
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testKey();
