const express = require('express');
const axios = require('axios');
const mongo = require('mongodb').MongoClient;
const app = express();
const port = 1993;
const exphbs = require('express-handlebars');
const { getDataz, exchangeCode, authorize }  = require('./controller');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));

var users = {};
var ratings = {};

var getCompanies = function(name) {
    mongo.connect('mongodb://10.13.5.54:27017', function(err, db) {
        var cursor = db.db('hackathon').collection('ratings').find();
        cursor.each(function(err, doc) {
            ratings[1] = doc
        });
    });
};

app.get('/authorize', async (req, res) => {
    const URL = await authorize();
    res.redirect(URL);
});


app.get('/exchangeCode', async (req, res) => {
    const { code, id_token, state } = req.query;
    console.log(code, id_token, state);

    await exchangeCode(code);

    res.redirect('/app');
});


app.get('/callback', async (req, res) => {
    res.render('callback')
});

app.get('/login', async (req, res) => {
    res.render('login', {
        helpers: {
            title: function () { return 'Good Mark.'; }
        }
    }
)});

app.get('/app', async (req, res) => {

    const { Data: { Transaction }} = await getDataz();

    console.log(Transaction)

    res.render('app', {
            helpers: {
                title: function () { return 'Good Mark.'; },
                data: () => Transaction
            }
        }
    )
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
