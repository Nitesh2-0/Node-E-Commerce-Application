var express = require('express');
var router = express.Router();
const userModel = require('../models/users')
const passport = require('passport');
const localStategy = require('passport-local');
const auth = require('../passport-auth');
const upload = require('./multer')
const productModel = require('../models/products')
const addToCartModel = require('../models/addToCart');
const { route } = require('../routes/razorpay');
passport.use(new localStategy(userModel.authenticate()));

/* GET Login Page. */
router.get('/', function (req, res, next) {
  // res.redirect('/sellerProfile')
  res.render('login')
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

    userModel.register(userData, req.body.password).then(function (registerUser) {
      passport.authenticate('local')(req, res, function () {
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
router.get('/feed', auth, async (req, res) => {
  try {
    const username = req.user.username;
    const data = await userModel.findOne({ username });
    const name = data.fullName.split(' ')[0];
    const userFeedData = {
      location: data.State + " " + data.Zip,
      name: name,
      img: data.profileImg,
    }
    if (!data) {
      return res.redirect('/register');
    }
    const allProducts = await productModel.find();
    res.render('feed', { userFeedData , allProducts})
  } catch (error) {
    res.redirect('/register');
  }
});

/* GET sellerProfile Page */
router.get('/sellerProfile', auth, async (req, res) => {
  try {
    const username = req.user.username;
    const authSeller = await userModel.findOne({ username })
    const seller = {
      profileImg: authSeller.profileImg,
      sellerName: authSeller.fullName.split(' ')[0]
    }
    const products = await productModel.find({sellerId : req.user._id}); 
    res.render('sellerProfile', { seller , products});
  } catch (error) {
    console.log(error.message);
    res.redirect('feed')
  }
});

/* POST Razorpay Payment  */
router.post('/createOrder', auth, require('../routes/razorpay'));

/* POST AddToCart Iteam */
router.post('/feed/addToCart', auth, async (req, res) => {
  try {
    const { productName, price, productImg } = req.body
    const username = req.user.username;
    const newIteam = new addToCartModel({
      productName: productName,
      productImg: productImg,
      price: price,
      username: username
    })
    const data = await newIteam.save();

    res.status(200).send(data)
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: 'Internal Server Error' })
  }
})

/* GET AddToCaet Item  */
router.get('/feed/addToCart/show', auth, async (req, res) => {
  try {
    const cartProduct = await addToCartModel.find({ username: req.user.username })
    res.status(200).send(cartProduct)
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error')
  }
})

/* POST Delete Cart Items */
router.get('/feed/addToCart/show/:name', auth, async (req, res) => {
  try {
    await addToCartModel.findOneAndDelete({ username: req.user.username, productName: req.params.name })
    console.log(req.params.name);
    res.redirect('/feed')
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
})

/* POST Add Product - Seller */
router.post('/sellerProfile/Create-Product', upload.array('images'), auth , async (req, res) => {
  try {
    const { productName, stock, offer, productPrice,descpt } = req.body;
    const newProduct = new productModel({
      productName:productName.trim(),
      sellerId: req.user._id, 
      productPrice: productPrice.trim(),
      offer :offer.trim(),
      stock:stock.trim(),
      images:req.files.map(file => 'uploads/' + file.filename),
      descpt:descpt.trim()
    });

    await newProduct.save();
    res.redirect('/sellerProfile')
  } catch (error) {
    console.log(error);
    res.redirect('/sellerProfile')
  }
});

/* GET Delete Product - Seller */
router.get('/sellerProfile/delete/:id', auth , async (req,res) => {
  try {
    const {id} = req.params
    const deletedProduct = await productModel.findOneAndDelete({_id:id}); 
    console.log(deletedProduct);
    res.status(200).json({success:true, message:'Product Deleted Successfully.'})
  } catch (error) {
    res.status(500).json({success:false , message:'Internal Server Error'})
  }
})

module.exports = router;
