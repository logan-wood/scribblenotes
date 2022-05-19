const db = require('../db')

module.exports = {
    fufillSingleNote: (session) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE users SET credits = credits + 5 WHERE email = ?', session.customer_email, function (error) {
                if (error) return reject(error);
                
                return resolve()
            })
        })
    },

    changeSubscription: (subscription, email) => {
        db.query('UPDATE users SET subscription = ? WHERE email = ?', [subscription, email], function(error) {
            if (error) return error;
        });
    },

    fufillRegularSender: (email) => {
        db.query('UPDATE users SET credits = credits + 250 WHERE email = ?', email, function(error) {
            if (error) return error;
        })
    },

    fufillBulkNotes: (email) => {
        db.query('UPDATE users SET credits = credits + 1000 WHERE email = ?', email, function(error) {
            if (error) return error;
        })
    },

    updateStripeCustomerID: (cust_id, email) => {
        db.query('UPDATE users SET stripe_cust_id = ? WHERE email = ?', [cust_id, email], function(error) {
            if (error) return error;
        })
    }

    
}