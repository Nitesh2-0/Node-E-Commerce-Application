var express = require('express');
var router = express.Router();
const userModel = require('../models/users')
const passport = require('passport');
const localStategy = require('passport-local');
const auth = require('../passport-auth');
const {upload , uploadSingle} = require('./multer')
const productModel = require('../models/products')
const addToCartModel = require('../models/addToCart');
passport.use(new localStategy(userModel.authenticate()));


/* GET Login Page. */
router.get('/', function (req, res, next) {
  // res.redirect('/cart')
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

/* POST Register Page */
router.post('/register', async function (req, res) {
  try {
    const { fname, username, phone, Locality, State, Zip, sex, Country, CountryCode } = req.body;

    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      return res.render('register', { message: 'Email already exists' });
    }
    const fullName = fname;
    const userData = new userModel({ username , fullName, email:username, phone, Locality, State, Zip, sex, Country, CountryCode });

    userModel.register(userData, req.body.password).then(function (registerUser) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/feed');
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

/* GET Feed Page - User */
router.get('/feed', auth , async (req, res) => {
  try {
    const username = req.user.username;
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.redirect('/register');
    }

    const name = user.fullName.split(' ')[0];
    const userFeedData = {
      location: user.State + " " + user.Zip,
      name: name,
      img: user.profileImg ? user.profileImg : 'profileImage.avif', 
    };

    const allProducts = await productModel.find();
    res.render('feed', { user, userFeedData, allProducts });
  } catch (error) {
    console.log(error); 
    res.redirect('/register');
  }
});

/* GET sellerProfile Page - Seller */
router.get('/sellerProfile', auth, async (req, res) => {
  try {
    const username = req.user.username;
    const authSeller = await userModel.findOne({ username })
    const seller = {
      profileImg: authSeller.profileImg,
      sellerName: authSeller.fullName.split(' ')[0]
    }
    const products = await productModel.find({ sellerId: req.user._id });
    res.render('sellerProfile', { seller, authSeller, name: req.user.fullName, products });
  } catch (error) {
    console.log(error.message);
    res.redirect('feed')
  }
});

/* POST Razorpay Payment - User  */
router.post('/createOrder', auth, require('../routes/razorpay'));

/* POST AddToCart Iteam - Seller */
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

/* GET AddToCaet Item - User */
router.get('/feed/addToCart/show', auth, async (req, res) => {
  try {
    const cartProduct = await addToCartModel.find({ username: req.user.username })
    res.status(200).send(cartProduct)
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error')
  }
})

/* POST Delete Cart Items - Seller */
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
router.post('/sellerProfile/Create-Product', upload.array('images'), auth, async (req, res) => {
  try {
    const { productName, stock, offer, productPrice, descpt } = req.body;
    const newProduct = new productModel({
      productName: productName.trim(),
      sellerId: req.user._id,
      productPrice: productPrice.trim(),
      offer: offer.trim(),
      stock: stock.trim(),
      images: req.files.map(file => 'uploads/' + file.filename),
      descpt: descpt.trim()
    });

    await newProduct.save();
    res.redirect('/sellerProfile')
  } catch (error) {
    console.log(error);
    res.redirect('/sellerProfile')
  }
});

/* GET Delete Product - Seller */
router.get('/sellerProfile/delete/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const deletedProduct = await productModel.findOneAndDelete({ _id: id });
    console.log(deletedProduct);
    res.status(200).json({ success: true, message: 'Product Deleted Successfully.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
})

/* GET Update Profile - User */
router.get('/feed/user/:id', auth, async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('update', { user });
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).send('Server error');
  }
});

/* POST Update Profile - User */
router.post('/feed/updated/:id', uploadSingle.single('profileImg') , auth , async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, Locality, Country, State, Zip, sex } = req.body;
    
    const user = await userModel.findOne({ _id: id });
    
    if (user) {
      if (fullName !== undefined && user.fullName !== fullName) {
        user.fullName = fullName;
      }
      if (phone !== undefined && user.phone !== phone) {
        user.phone = phone;
      }
      if (Locality !== undefined && user.Locality !== Locality) {
        user.Locality = Locality;
      }
      if (Country !== undefined && user.Country !== Country) {
        user.Country = Country;
      }
      if (State !== undefined && user.State !== State) {
        user.State = State;
      }
      if (Zip !== undefined && user.Zip !== Zip) {
        user.Zip = Zip;
      }
      if (sex !== undefined && user.sex !== sex) {
        user.sex = sex;
      }
      if (req.file && req.file.filename) {
        user.profileImg = '/profiles/' + req.file.filename; 
      }      

      await user.save();
      res.redirect('/feed');
    } else {
      res.redirect('/')
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

/* GET Open Cart - User */
router.get('/feed/cart/:id', auth , async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.findOne({_id:productId})
    res.render('openCart', {product}); 
  } catch (error) {
    console.error('Error:', error);
    res.redirect('/')
  }
});

/* POST REGEX-Request | Search -  User */
router.get('/feed/search', async (req, res) => {
  const regexPattern = req.query.pattern;
  const ignoreCase = req.query.ignoreCase === 'true'; 
  const regex = new RegExp(regexPattern, ignoreCase ? 'i' : '');
  try {
    const searchData = await productModel.find({
      $or: [
        {  productName: regex },
      ]
    });
    res.json(searchData);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;