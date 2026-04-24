const http = require('http');

// 1. Login
const loginData = JSON.stringify({ email: 'admin@example.com', password: 'Admin123!' });
const loginReq = http.request({
  hostname: 'localhost', port: 4000, path: '/api/v1/auth/login',
  method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const json = JSON.parse(body);
    const token = json.data?.accessToken;
    if (!token) { console.log('Login failed:', body); return; }
    console.log('✅ Login OK');

    // 2. Get pending orders
    const getReq = http.request({
      hostname: 'localhost', port: 4000, path: '/api/v1/orders?status=PENDING&limit=1',
      method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
    }, (r) => {
      let b = '';
      r.on('data', d => b += d);
      r.on('end', () => {
        const orders = JSON.parse(b);
        const orderId = orders.data?.data?.[0]?.id || orders.data?.[0]?.id;
        if (!orderId) { console.log('No pending orders, response:', b.substring(0, 200)); return; }
        console.log('Order ID:', orderId);

        // 3. Schedule call
        const schedData = JSON.stringify({ delaySeconds: 10 });
        const schedReq = http.request({
          hostname: 'localhost', port: 4000, path: `/api/v1/calls/schedule/${orderId}`,
          method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': schedData.length }
        }, (sr) => {
          let sb = '';
          sr.on('data', d => sb += d);
          sr.on('end', () => {
            console.log('Schedule result:', sb);
          });
        });
        schedReq.write(schedData);
        schedReq.end();
      });
    });
    getReq.end();
  });
});
loginReq.write(loginData);
loginReq.end();
