var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Order = require('../models/order');

var Product = require('../models/product');

/* GET home page. */
router.get('/', (req, res, next) => {
	var successMsg = req.flash('success')[0];
	Product.find((err, docs) => {
		var productChunks = [];
		var chunkSize = 3;
		for (let i = 0; i < docs.length; i += chunkSize) {
			productChunks.push(docs.slice(i, i + chunkSize));
		}
		res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg });
	});
});
router.get('/add-to-cart/:id', (req, res, next) => {
	var productId = req.params.id;

	// create cart object. If already have cart in session, pass it, otherwise - pass empty oblect
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	// find product in database via mongoose
	Product.findById(productId, (err, product) => {
		if (err) {
			return res.redirect('/');
		}
		cart.add(product, product.id);

		// store it in cart object in session
		req.session.cart = cart;

		res.redirect('/');
	});
});
router.get('/reduce/:id', (req, res, next) => {
	var productId = req.params.id;

	// create cart object. If already have cart in session, pass it, otherwise - pass empty oblect
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.reduceByOne(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});
router.get('/remove/:id', (req, res, next) => {
	var productId = req.params.id;

	// create cart object. If already have cart in session, pass it, otherwise - pass empty oblect
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.removeItem(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});

router.get('/shopping-cart', (req, res, next) => {
	// if we don't have a cart
	if (!req.session.cart) {
		return res.render('shop/shopping-cart', { products: null });
	}

	// recreating the cart
	var cart = new Cart(req.session.cart);

	res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});

router.get('/checkout', isLoggedIn, (req, res, next) => {
	// if we don't have a cart
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}

	// recreating the cart
	var cart = new Cart(req.session.cart);

	var errMsg = req.flash('error')[0];
	res.render('shop/checkout', { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg });
});

router.post('/checkout', isLoggedIn, (req, res, next) => {
	// if we don't have a cart
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}

	// recreating the cart
	var cart = new Cart(req.session.cart);

	var stripe = require("stripe")(
		"sk_test_Qa5bYJpccTzqgGmfXFnYH7Om"
	);

	stripe.charges.create({
		amount: cart.totalPrice * 100,
		currency: "usd",
		source: req.body.stripeToken, // obtained with Stripe.js
		description: "Test Charge"
	}, function (err, charge) {
		// asynchronously called
		if (err) {
			req.flash('error', err.message);
			return res.redirect('/checkout');
		}

		// create order
		var order = new Order({
			user: req.user,
			cart: cart,
			address: req.body.address,
			name: req.body.name,
			paymentId: charge.id
		});

		// save order to the database
		order.save((err, result) => {
			// show success message
			req.flash('success', 'Succesfully bought product');

			// clear cart
			req.session.cart = null;

			res.redirect('/');
		});
	});
});

module.exports = router;

// checks if the user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
	}

	// store old url in session (to remember the initial route)
	req.session.oldUrl = req.url;

    res.redirect('/user/signin');
}