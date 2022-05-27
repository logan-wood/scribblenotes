const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const bodyParser = require('body-parser');
const express = require('express');
const stripeController = require('../controllers/stripeController');
const { isAuthenticated } = require('../auth/isAuthenticated');
const db = require('../db');
const adminController = require('../controllers/adminController');

const router = express.Router();

const REGULAR_SENDER = 'price_1Ky7ejKpJ99xu55gG1aoy4V1';
const BULK_NOTES = 'price_1KyzgjKpJ99xu55g1k1jPVwX';

router.post('/single_note', isAuthenticated, async function(req, res) {
    const session = await stripe.checkout.sessions.create({
        line_items: [{
            price: 'price_1Kx2nUKpJ99xu55grNJRy8Vb', //update with live
            quantity: 1
        }],
        customer_email: req.user.email,
        mode: 'payment',
        success_url: process.env.DOMAIN + 'payment/success',
        cancel_url: process.env.DOMAIN + 'payment/cancel'
    });

    //send user to stripe checkout
    res.redirect(303, session.url);
});

router.post('/regular_sender', isAuthenticated, async (req, res) => {
    console.log('regular sender')

    const session = await stripe.checkout.sessions.create({
        customer_email: req.user.email,
        billing_address_collection: 'auto',
        line_items: [
            {
                price: REGULAR_SENDER,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: process.env.DOMAIN + 'payment/success',
        cancel_url: process.env.DOMAIN + 'payment/cancel'
    });

    //send user to stripe checkout
    res.redirect(303, session.url)
})

router.post('/bulk_notes', isAuthenticated, async (req, res) => {
    const prices = await stripe.prices.list({
        lookup_keys: [req.body.lookup_key],
        expand: ['data.product'],
    });

    const session = await stripe.checkout.sessions.create({
        customer_email: req.user.email,
        billing_address_collection: 'auto',
        line_items: [
            {
                price: BULK_NOTES,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: process.env.DOMAIN + 'payment/success',
        cancel_url: process.env.DOMAIN + 'payment/cancel'
    });

    res.redirect(303, session.url);
})

router.post('/create-customer-portal-session', async (req, res) => {
    console.log('router called');
    const session = await stripe.billingPortal.sessions.create({
        customer: req.user.stripe_id,
        return_url: process.env.DOMAIN + 'user_settings'
    });

    res.redirect(303, session.url);
})

router.get('/success', (req, res) => {
    res.render('payments/success');
});

router.get('/cancel', (req, res) => {
    res.render('payments/cancel')
});

//webhook called on successfull payment
router.post('/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_ENDPOINT_SECRET);
    } catch (e) {
        return res.status(400).send('Webhook Error: ' + e.message);
    }

    if (event.type === 'invoice.paid') {
        //get a unique index belonging to the subscription the user purchased.
        const lines = event.data.object.lines.data;
        const priceID = lines[0].price.id;

        //store customer email and stripe id in variable
        const user_email = event.data.object.customer_email;
        const customer_id = event.data.object.customer;

        //regular sender
        if (priceID === REGULAR_SENDER) {
            stripeController.changeSubscription('regular_sender', user_email);
            stripeController.fufillRegularSender(user_email);
            stripeController.updateStripeCustomerID(customer_id, user_email);
            // to-do
            // adminController.updateTotalSubscriptions(1);
        }

        if (priceID === BULK_NOTES) {
            stripeController.changeSubscription('bulk_notes', user_email);
            stripeController.fufillBulkNotes(user_email);
            stripeController.updateStripeCustomerID(customer_id, user_email);
            // to-do
            // adminController.updateTotalSubscriptions(1);
        }
        
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        if (session.mode === 'payment') {
            await stripeController.fufillSingleNote(session);
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        // todo
        // adminController.updateTotalSubscriptions(-1);
        
        const customer = event.data.object.customer
        
        //set subscription to 'none' in database (this doesn't use the function in stripeController because the user email isnt sent in this post request)
        db.query(`UPDATE users SET subscription = 'none' WHERE stripe_cust_id = ?`, customer, function(error) {
            if (error) throw error;
        });
    }

    res.json({received: true});
});

module.exports = router