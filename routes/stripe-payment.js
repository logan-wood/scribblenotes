const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const bodyParser = require('body-parser');
const express = require('express');
const stripeController = require('../controllers/stripeController')

const router = express.Router();

router.post('/single_note', async function(req, res) {
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

router.post('/regular_sender', async (req, res) => {
    const prices = await stripe.prices.list({
        lookup_keys: [req.body.lookup_key],
        expand: ['data.product'],
    });

    const session = await stripe.checkout.session.create({
        billing_address_collection: 'auto',
        line_items: [
            {
                price: prices.data[0].id,
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

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        await stripeController.fufillSingleNote(session)
    }

    res.status(200);
});

module.exports = router