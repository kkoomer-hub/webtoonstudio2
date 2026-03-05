
const apiKey = "AIzaSyAsgmBCGpmYYR2jwCgqt2rU7U8xgtulTBU";

async function listModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    if (data.models) {
      console.log(data.models.map(m => m.name).join('\n'));
    } else {
      console.log('No models found or error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
