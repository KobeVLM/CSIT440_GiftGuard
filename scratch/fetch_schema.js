const https = require('https');

const host = 'dev318294.service-now.com';
const auth = 'Basic ' + Buffer.from('t_admin1:GiftGuard2024!').toString('base64');
const table = 'x_1994889_csit440_gift_card_dispute';

const options = {
    hostname: host,
    path: `/api/now/table/sys_dictionary?sysparm_query=name=${table}&sysparm_fields=element,internal_type,max_length,column_label&sysparm_display_value=true`,
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
            if (json.result) {
                json.result.forEach(field => {
                    console.log(`Label: ${field.column_label} | Element: ${field.element}`);
                });
            } else {
                console.log("Error:", json);
            }
        } catch(e) {
            console.log("Parse Error:", e.message);
            console.log(data);
        }
    });
});

req.on('error', e => console.error(e));
req.end();
