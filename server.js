const express = require('express');
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

app.get('/login', async (req, res) => {
    res.render('login', {
        helpers: {
            title: function () { return 'Good Mark.'; }
        }
    }
)});

app.get('/app', async (req, res) => {
    res.render('app', {
            helpers: {
                title: function () { return 'Good Mark.'; }
            }
        }
    )});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))