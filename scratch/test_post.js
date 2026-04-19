const https = require('https');

const host = 'dev318294.service-now.com';
const auth = 'Basic ' + Buffer.from('t_customer1:GiftGuard2024!').toString('base64');
const table = 'x_1994889_csit440_gift_card_dispute';

const payload = JSON.stringify({
    customer_name: "Test Customer",
    customer_email: "test@example.com",
    gift_card_issuer: "Target",
    expected_balance: "100.00",
    reported_balance: "0.00",
    fraud_amoun0: "100.00"
});

const options = {
    hostname: host,
    path: `/api/now/table/${table}`,
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth,
        'Content-Length': payload.length
    }
};

const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log("Status Code:", res.statusCode);
        console.log("Response:", data);
    });
});
req.write(payload);
req.end();
