const https = require('https');

const host = 'dev318294.service-now.com';
const auth = 'Basic ' + Buffer.from('t_admin1:GiftGuard2024!').toString('base64');
const table = 'x_1994889_csit440_gift_card_dispute';

const options = {
    hostname: host,
    path: `/api/now/table/${table}?sysparm_query=number=GCD0001001&sysparm_limit=1`,
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Authorization': auth
    }
};

const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.result && json.result.length > 0) {
                const rec = json.result[0];
                console.log("Issuer:", rec.gift_card_issuer);
                console.log("Card Number:", rec.gift_card_number);
                console.log("Fraud amoun0:", rec.fraud_amoun0);
                console.log("Expected bal:", rec.expected_balance);
                console.log("Reported bal:", rec.reported_balance);
            }
        } catch(e) {
            console.log("Parse Error:", e.message);
        }
    });
});
req.end();
