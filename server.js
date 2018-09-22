const express = require('express');
const axios = require('axios');
const app = express();
const port = 1993;

app.get('/', async (req, res) => {

  try {
    const data = await axios.get('https://rs.aspsp.ob.forgerock.financial/open-banking/mtlsTest', {
    'Postman-Token': '3d43b021-9308-4124-82ab-64cfc9119f3e',
     'Cookie': 'cookiename=werewrw;cook',
     'Pragma': 'no-cache',
     'Cache-Control': 'no-cache'
   });
    res.status(200).send(data.data);
  } catch(e) {
    res.status(500).send('API failed');
  }

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))