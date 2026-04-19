const https = require('https');

const host = 'dev318294.service-now.com';
const auth = 'Basic ' + Buffer.from('t_admin1:GiftGuard2024!').toString('base64');
const table = 'x_1994889_csit440_gift_card_dispute';

const options = {
    hostname: host,
    path: `/api/now/table/${table}?sysparm_limit=1`,
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
        console.log("Status Code:", res.statusCode);
        try {
            const json = JSON.parse(data);
            if (json.result && json.result.length > 0) {
                console.log("Record Keys:", Object.keys(json.result[0]).join(', '));
                // Find all keys containing issuer, card, amount, etc.
                const interesting = Object.keys(json.result[0]).filter(k => 
                    k.includes('issuer') || k.includes('card') || k.includes('amount') || 
                    k.includes('decision') || k.includes('sla') || k.includes('expected')
                );
                console.log("\nInteresting Fields:", interesting.join('\n'));
            } else {
                console.log("No records found.", json);
            }
        } catch(e) {
            console.log("Parse Error:", e.message);
        }
    });
});

req.on('error', e => console.error(e));
req.end();
