const fs = require('fs');
const https = require('https');

const options = {
  // hostname: 'rs.aspsp.ob.forgerock.financial',
  // path: '/open-banking/mtlsTest',
  port: 443,
  // method: 'GET',
  key: fs.readFileSync('./9605a69a-6c81-459e-8d02-592c9dc9adde.key'),
  cert: fs.readFileSync('./9605a69a-6c81-459e-8d02-592c9dc9adde.pem'),
  JSON: true
};

const makeRequest = (args = {}) => {
  return new Promise((resolve, reject) => {
    const reqOptions = {
        ...options,
        ...args
    };
    const req = https.request(reqOptions, (res) => {
        let body = [];
        res.on('data', (chunk) => body.push(chunk));
        res.on('end', function() {
            try {
                const stringBuffer = Buffer.concat(body).toString();
                body = reqOptions.JSON ? JSON.parse(stringBuffer) : stringBuffer;
            } catch(e) {
                reject(e);
            }
            resolve(body);
        });
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
};

module.exports = makeRequest;