const express = require('express');
const path = require('path');
const axios = require('axios');
const mongo = require('mongodb').MongoClient;
const app = express();
const port = 1993;
const exphbs = require('express-handlebars');
const makeRequest = require('./makeRequest');

makeRequest({ path: '/open-banking/mtlsTest' })
    .then( (data) => {
        console.log(data);
    });

app.engine('handlebars', exphbs({defaultLayout: 'main'})); app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public'), { dotfiles: 'ignore', etag: false,
    extensions: ['htm', 'html'],
    index: false
}));

var users = {};
var ratings = {};

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

var getCompanies = function(name) {
    mongo.connect('mongodb://10.13.5.54:27017', function(err, db) {
        var cursor = db.db('hackathon').collection('ratings').find();
        cursor.each(function(err, doc) {
            ratings[1] = doc
        });
    });
};

app.get('/login', async (req, res) => {
    res.render('login');
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))