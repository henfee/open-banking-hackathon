const makeRequest = require('./makeRequest');

makeRequest({ path: '/open-banking/mtlsTest' })
  .then( (data) => {
    console.log(data);
  });