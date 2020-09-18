let express=require('express')
const app=express();
let router = express.Router();
const salt= require('crypto')
const jwt =require('jsonwebtoken')
let path = require('path');
let cookieParser = require('cookie-parser')
const passport= require('passport')
require('./auth/passport')(app)
var MongoClient = require('mongodb').MongoClient;
const User=require('./models/userdata')
const House=require('./models/Housedata')
const Card=require('./models/cardDetails')

app.use(express.urlencoded());
app.use(cookieParser());

const port= process.env.PORT || '3002'

app.use(express.static(__dirname));
  router.route('/login')
   .get(passport.authenticate('local', { failureRedirect: '/fail' }),
     function(req, res) {
       console.log(req.headers['cookie']);
       console.log('set='+req.headers['set']);
     res.redirect('/loginsuccess?uname='+req.user.username);
  })

  router.route('/regis')
    .post(async (req, res) =>{
      const {
        username,
        password,
        agreementDate,
        startDate,
        agreementNo,
        companyName,
        street,
        state,
        postCode,
        phone,
        email,
        furnitureName,
        Quantity,
        telephonicLine,
        carParking,
        totalMonthlyRate,
        securityDeposit,
        keySet,
        boomGateRemote

      } = req.body;

        var mykey = salt.createCipher('aes-128-cbc', 'mypassword');
        var mystr = mykey.update(password, 'utf8', 'hex')
        mystr += mykey.final('hex');
      const create_user= new User({
         username,
        password: mystr,
        agreementDate,
        startDate,
        agreementNo,
        companyName,
        street,
        state,
        postCode,
        phone,
        email,
        furnitureName,
        Quantity,
        telephonicLine,
        carParking,
        totalMonthlyRate,
        securityDeposit,
        keySet,
        boomGateRemote
      });
      const user = await create_user.save();
      var token = jwt.sign({ id: user._id }, 'SECREAT', {
        expiresIn: 360 // expires in 24 hours
      });
        if(user.username === username){
        res.cookie('jToken',token);
        res.set('sToken',token);
        res.redirect('/');
        }
        else
        res.redirect('/regis');
  })

  router.route('/home')
  .post(async (req, res) =>{
    const {office,space,price,dateFrom,dateTo} = req.body;
    const Fetch_House= new House({userName:req.cookies.UName,office,space,price,dateFrom,dateTo})
    const house = await Fetch_House.save();
    res.redirect('/homesuccess');
})

router.route('/payment')
.post(async (req, res) =>{
  console.log(req.cookies.UName);
  const {cardholder,expdate,cvv,cardno} = req.body;
  var myCVV = salt.createCipher('aes-128-cbc', 'cvv');
  var cryptedCVV = myCVV.update(cvv, 'utf8', 'hex')
  cryptedCVV += myCVV.final('hex');
  var myCard = salt.createCipher('aes-128-cbc', 'card');
  var cryptedCard = myCard.update(cardno, 'utf8', 'hex')
  cryptedCard += myCard.final('hex');
  const Fetch_Card= new Card({userName:req.cookies.UName,cardholder,expdate,cvv:cryptedCVV,cardno:cryptedCard})
  const card = await Fetch_Card.save();
  res.clearCookie('UName');
  res.end('<p><a href="/">successfully completed the payment.Click here to Login</a></p>')
})

    app.get('/loginsuccess', (req, res) => {
    // res.send("Welcome "+req.query.uname+"!!")   ?uname='+req.user.username
    res.redirect('/home?Loggeduser='+req.query.uname);
  });

  app.get('/homesuccess', (req, res) => {
    res.redirect('/payment');
  });

  app.get('/fail', (req, res) => 
    res.redirect('/regis')
  );

  app.get('/', (req, res) => 
   res.sendFile('login.html', { root : __dirname}));

  app.get('/regis', (req, res) => 
    res.sendFile('agreement.html', { root : __dirname}));

    app.get('/home', (req, res) => {
    res.sendFile('home.html', { root : __dirname}),
    res.cookie('UName',req.query.Loggeduser);
    console.log('uname from login page='+req.query.Loggeduser)
    });
    app.get('/payment', (req, res) => 
    res.sendFile('payment.html', { root : __dirname}));

  app.use('',router)
  app.listen(port,()=>{
    console.log(`listen at :${port}`);
})

