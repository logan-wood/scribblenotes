module.exports = {
    fufillSingleNote: (req) => {
        db.query('UPDATE users SET credits = credits + 5 WHERE user_id = ?', req.user.user_id, function (error) {
            if (error) throw error;

            console.log('credits updated')
        })
    },
}