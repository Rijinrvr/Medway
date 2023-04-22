const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');


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
let User = require('./models/users');


//Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: false,

}));

//Express messages middleware
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
// app.use(function(req, res, next){
//     if (!req.session.username && req.path != '/user/login' && req.path != '/user/signup') {
//         res.redirect('/user/login')
//     }
//     next();
// })


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', function(req, res){
    Medway.find({}, function(err, medicines){
        if (err) {
            console.log(err);
        }
        else {
          return res.render('medicine', {
           title: 'Medway',
           medicines: medicines
  });
        } 
    });
});


app.get('/medicine/add', function(req, res){
   return  res.render('add', {
        title: 'Add Medicine'
    })
});

const { body, validationResult } = require('express-validator');

app.post('/medicine/add', 
    [
        body('medicine').notEmpty().withMessage('Medicine is required'),
        body('doctorname').notEmpty().withMessage('Doctorname is required'),
        body('discription').notEmpty().withMessage('Discription is required'),
    ],
    function(req, res){
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
           return res.render('add', {
                title: 'Add Article',
                errors: errors.array()
            })
        } 
        else {
             let addmed = new Medway();
             addmed.medicine = req.body.medicine;
             addmed.doctorname = req.body.doctorname;
             addmed.discription = req.body.discription;
             addmed.save(function(err){
        if(err) {
            console.log(err);
            return;
        } else {
             req.flash('success', 'Article Added')
          return  res.redirect('/');
        }
            });
        }
});

//-------------Edit-------------------------------------------------------------------

app.get('/medicine/:id', function(req, res){
    Medway.findById(req.params.id, function (err, medicine) {  //----------------------To view the details--------------------------
       return res.render('article', {
            medicine: medicine
        });
    });
});

app.get('/medicine/edit/:id', function(req, res){
    Medway.findById(req.params.id, function(err, medicine){
       return res.render('edit',{
            title: "Edit Medicine",
            medicine: medicine
        })
    })
});

app.post('/medicine/edit/:id', function(req, res){
    let editmed = {};
    editmed.medicine = req.body.medicine;
    editmed.doctorname = req.body.doctorname;
    editmed.discription = req.body.discription;

    let query = {_id:req.params.id}

    Medway.updateOne(query, editmed, function (err) {
        if(err) {
            console.log(err);
            return res.status(500).send(err)
        } else {
            
            res.redirect('/');
            return; // Add a return statement here
        }
    });
});


//---------Delete---------------------------------------------------------------

app.delete('/medicine/delete/:id', function(req, res){
 let article = new Medway();
    article.medicine = req.body.medicine;
    article.doctorname = req.body.doctorname;
    article.discription = req.body.discription;
    let query = { _id: req.params.id };
    
    // console.log("delete called for query : ", query);

    Medway.deleteOne(query, article,function(err){
        if (err) {
            console.log(err);    
        }
    })

    res.send("Success")
});

//--------Search----------------------------------------------------------

app.get('/search', function(req,res){
    res.render('search')
})

app.post('/getArticles',async(req,res)=>{
    let payload=req.body.payload.trim();
    let search=await Medway.find({medicine: {$regex: new RegExp('^'+payload+'.*','i')}}).exec();
    // console.log(payload)
    search=search.slice(0,10)
    res.send({payload:search});
});


//------------Login------------------------------------------------------------

let users = require('./router/user');
app.use('/user', users);

//----------Signup-----------------------------------------------------------
app.get('/user/signup', (req, res) => {
  res.render('signup'); // render the signup.pug template
});
app.post('/signup', function (req, res) {
    console.log(req.body);

    const newUser=new User();
    newUser.username=req.body.username;
    newUser.password=req.body.password
    newUser.email=req.body.email;
    newUser.confirm_password=req.body.confirm_password;
    
    newUser.save(function(err,result){
        if(err){
            console.log(err)
            return;
        }
        else{
            console.log(result)
            res.render("login");
           
        }
    })
})

app.listen(3001);