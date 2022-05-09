const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET
const bodyParser = require('body-parser');
const { response } = require('express');
const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/single_note', async function(req, res) {
    const session = await stripe.checkout.sessions.create({
        line_items: [{
            price: 'price_1Kx2nUKpJ99xu55grNJRy8Vb', //update with live
            quantity: req.body.quantity
        }],
        customer_email: req.user.email,
        mode: 'payment',
        success_url: process.env.DOMAIN + 'payment/success',
        cancel_url: process.env.DOMAIN + 'payment/cancel'
    });

    res.redirect(303, session.url);
});

router.get('/success', (req, res) => {
    res.render('payments/success');
});

router.get('/cancel', (req, res) => {
    res.render('payments/success')
});

//webhook called on successfull payment
router.post('/webhook', bodyParser.raw({type: 'application/json'}), (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (e) {
        console.log('error catched ' + e)
        return response.status(400).send('Webhook Error: ' + e.message);
    }

    console.log(event.type)

    if (event.type === 'checkout.session.completed') {
        console.log(event.data.object)
    }

    res.status(200);
});

module.exports = router