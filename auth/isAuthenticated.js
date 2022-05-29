module.exports = {
    isAuthenticated:function(req, res, next) {
        if(req.isAuthenticated()) {
            console.log('isAuthenticated(): User is authenticated');
            return next();
        }
        else{
            console.log('isAuthenticated(): User is not authenticated');
            res.redirect('/login');
        }
        
    }
}