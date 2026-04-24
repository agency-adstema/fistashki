const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
console.log('API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND');

const data = JSON.stringify({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Say hello in Serbian, one sentence.' }],
  max_tokens: 30
});

const options = {
  hostname: 'api.openai.com',
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const json = JSON.parse(body);
    if (json.error) {
      console.log('\n❌ OPENAI ERROR:', json.error.message);
      console.log('Error type:', json.error.type);
      if (json.error.type === 'insufficient_quota') {
        console.log('\n⚠️  NEMA KREDITA - Trebaš dopuniti OpenAI nalog!');
      }
    } else {
      console.log('\n✅ OpenAI radi! Odgovor:', json.choices[0].message.content);
    }
  });
});

req.on('error', e => console.error('Request error:', e));
req.write(data);
req.end();
