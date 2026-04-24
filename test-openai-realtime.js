const WebSocket = require('ws');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
console.log('Testing OpenAI Realtime API...');
console.log('API Key:', apiKey ? apiKey.substring(0, 15) + '...' : 'NOT FOUND');

const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'OpenAI-Beta': 'realtime=v1',
  },
});

const timeout = setTimeout(() => {
  console.log('❌ TIMEOUT - No connection after 10 seconds');
  ws.close();
  process.exit(1);
}, 10000);

ws.on('open', () => {
  console.log('✅ WebSocket CONNECTED to OpenAI Realtime!');
  clearTimeout(timeout);
  
  // Send session update
  ws.send(JSON.stringify({
    type: 'session.update',
    session: {
      modalities: ['text', 'audio'],
      instructions: 'Say hello in Serbian.',
      voice: 'nova',
      output_audio_format: 'pcm16',
    }
  }));
  console.log('Sent session.update...');
  
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'response.create',
      response: { modalities: ['text', 'audio'] }
    }));
    console.log('Sent response.create...');
  }, 500);
  
  setTimeout(() => {
    console.log('Test complete, closing.');
    ws.close();
    process.exit(0);
  }, 5000);
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('Message:', msg.type, msg.error ? JSON.stringify(msg.error) : '');
});

ws.on('error', (err) => {
  console.log('❌ WebSocket ERROR:', err.message);
  clearTimeout(timeout);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log('WebSocket closed:', code, reason.toString());
});
