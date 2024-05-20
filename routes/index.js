var express = require('express');
var router = express.Router();
const userModel = require('../models/users')
const passport = require('passport');
const localStategy = require('passport-local');
const auth = require('../passport-auth');
passport.use(new localStategy(userModel.authenticate()));

/* GET Login Page. */
router.get('/', function (req, res, next) {
  res.render('login');
});

/* POST Login Page */
router.post('/login', passport.authenticate('local', {
  successRedirect: 'feed',
  failureRedirect: '/'
}))

/* GET Register page */
router.get('/register', (req, res, next) => {
  res.render('register', { message: '' })
})

/* POST Register Page | Error -> Bad Request*/
router.post('/register', async function (req, res) {
  try {
    const { fname, password, email, phone, Locality, State, Zip, sex, Country, CountryCode } = req.body;

    const existingUser = await userModel.findOne({ username: email });
    if (existingUser) {
      return res.render('register', { message: 'Email already exists' });
    }
    const fullName = fname;
    const userData = new userModel({ username: email, fullName, email, phone, Locality, State, Zip, sex, Country, CountryCode });

    userModel.register(userData,req.body.password).then(function(registerUser){
      passport.authenticate('local')(req,res,function(){
        res.redirect('/');
      })
    })

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/* GET Logout Btn */
router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  })
})

/* GET Feed Page */
router.get('/feed', auth , async (req, res) => {
  try {
    const username = req.user.username;
    const data = await userModel.findOne({ username });
    const name = data.fullName.split(' ')[0];
    const userFeedData = {
      location:data.State +" " + data. Zip,
      name : name,
      img : data.profileImg,
    }
    if (!data) {
      return res.redirect('/register');
    }
    res.render('feed',{userFeedData})
  } catch (error) {
    res.redirect('/register');
  }
});



module.exports = router;
