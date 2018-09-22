const fs = require('fs');
const https = require('https');

const options = {
  hostname: 'rs.aspsp.ob.forgerock.financial',
  port: 443,
  // path: '/open-banking/mtlsTest',
  method: 'GET',
  key: fs.readFileSync('./9605a69a-6c81-459e-8d02-592c9dc9adde.key'),
  cert: fs.readFileSync('./9605a69a-6c81-459e-8d02-592c9dc9adde.pem')
};

const makeRequest = (args = {}) => {
  return new Promise((resolve, reject) => {
    const req = https.request({
        ...args,
        ...options
      }, (res) => {
        let body = [];
        res.on('data', (chunk) => body.push(chunk));
        res.on('end', function() {
            try {
                body = JSON.parse(Buffer.concat(body).toString());
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