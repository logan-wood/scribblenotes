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
}