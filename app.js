const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/medway');
let db = mongoose.connection;

db.on('error', function(err){
    console.log(err);
});

db.once('open', function(){
    console.log("Connected to mongodb");
})
const app = express();

let Medway = require('./models/medicine');

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');




app.get('/', function(req, res){
    Medway.find({}, function(err, medicines){
        if (err) {
            console.log(err);
        }
        else {
           res.render('medicine', {
           title: 'Medway',
           medicines: medicines
  });
        } 
    });
});

app.get('/medicine/add', function(req, res){
    res.render('add', {
        title: 'Add Medicine'
    })
});

app.post('/medicine/add', function(req, res){
    let addmed = new Medway();
    addmed.medicine = req.body.medicine;
    addmed.doctorname = req.body.doctorname;
    addmed.discription = req.body.discription;
    addmed.save(function(err){
        if(err) {
            console.log(err);
            return;
        } else {
            res.redirect('/');
        }
    });
});

app.get('/medicine/:id', function(req, res){
    Medway.findById(req.params.id, function (err, medicine) {
     
        res.render('article', {
            medicine: medicine
        });
    });
});
app.get('/medicine/edit/:id', function(req, res){
    Medway.findById(req.params.id, function(err, medicine){
        res.render('edit',{
            title: "Edit",
            medicine: medicine
        })
    })
});

app.post('/medicine/edit/:id', function(req, res){
    let editmed = {};
    editmed.title = req.body.medicine;
    editmed.author = req.body.doctorname;
    editmed.body = req.body.discription;

    let query = {_id:req.params.id}
    Medway.update (query, medicine, function(err){
        if(err) {
            console.log(err);
            return;
        } else {
            res.redirect('/');
        }
    });
});

app.listen(2002);