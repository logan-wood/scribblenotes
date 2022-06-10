const db = require('../db');
const userController = require('./userController');
const fs = require('fs');
const storageBlob = require('@azure/storage-blob');

module.exports = {
    //notes
    getAllUncompletedNotes: () => {
        return new Promise((resolve, reject) =>
            db.query(`SELECT * FROM notes WHERE note_status <> 'completed'`, function(error, results) {
                if (error) { return reject(error) }

                return resolve(results);
            })
        )
    },

    getAllNoteCardInformation: async () => {
        return new Promise((resolve, reject) => {
            let data = []

            //get note information
            db.query(`SELECT * FROM notes WHERE note_status <> 'completed'`, function(error, results) {
                if (error) { return reject(error) }

                if (results.length === 0) { 
                    return resolve(null) 
                }

                var pending = results.length //used as an index, return function called when this reaches 0

                results.forEach(element => {
                    //get username
                    userController.getUserFromID(element.user_id).then(function(result, error) {
                        if (error) throw (error)

                        if (result) {
                            //create new data entry and append to data array
                            data.push({ createdAt: element.createdAt, filename: element.filename, note_id: element.note_id, user_id: element.user_id, note_status: element.note_status, name: element.note_name, username: result.username, email: result.email })

                            //check if getUserFromID needs to run any more times, and call return function accordingly
                            if (--pending === 0) {
                                return resolve(data);
                            }
                        }
                    });
                });
            })
        })
    }, 

    updateNoteStatus: (note_id, note_status) => {
        db.query('UPDATE notes SET note_status = ? WHERE note_id = ?', [note_status, note_id], function(error) {
            if (error) console.log(error)
        })
    },

    getAllCompletedNoteCardInformation: async () => {
        return new Promise((resolve, reject) => {
            let data = []

            //get note information
            db.query(`SELECT * FROM notes WHERE note_status = 'completed'`, function(error, results) {
                if (error) { return reject(error) }

                if (results.length === 0) { 
                    return resolve(null) 
                }

                var pending = results.length //used as an index, return function called when this reaches 0

                results.forEach(element => {
                    //get username
                    userController.getUserFromID(element.user_id).then(function(result, error) {
                        if (error) throw (error)

                        if (result) {
                            //create new data entry and append to data array
                            data.push({ createdAt: element.createdAt, filename: element.filename, note_id: element.note_id, user_id: element.user_id, note_status: element.note_status, name: element.note_name, username: result.username, email: result.email })

                            //check if getUserFromID needs to run any more times, and call return function accordingly
                            if (--pending === 0) {
                                return resolve(data);
                            }
                        }
                    });
                });
            })
        })
    }, 

    //campaigns
    getAllUncompletedCampaigns: () => {
        return new Promise((resolve, reject) =>
            db.query(`SELECT * FROM campaigns WHERE campaign_status <> 'completed'`, function(error, results) {
                if (error) { return reject(error) }

                return resolve(results);
            })
        )
    },

    getAllCampaignCardInformation: async () => {
        return new Promise((resolve, reject) => {
            let data = []

            //get note information
            db.query(`SELECT * FROM campaigns WHERE campaign_status <> 'completed'`, function(error, results) {
                if (error) { return reject(error) }

                if (results.length === 0) { 
                    return resolve(null) 
                }

                var pending = results.length //used as an index, return function called when this reaches 0

                results.forEach(element => {
                    //get username
                    userController.getUserFromID(element.user_id).then(function(result, error) {
                        if (error) throw (error)

                        if (result) {
                            //create new data entry and append to data array
                            data.push({ filename: element.filename, campaign_id: element.campaign_id, user_id: element.user_id, campaign_status: element.campaign_status, name: element.campaign_name, createdAt: element.createdAt, username: result.username, email: result.email })

                            //check if getUserFromID needs to run any more times, and call return function accordingly
                            if (--pending === 0) {
                                return resolve(data);
                            }
                        }
                    });
                });
            })
        })
    }, 

    updateCampaignStatus: (campaign_id, campaign_status) => {
        db.query('UPDATE campaigns SET campaign_status = ? WHERE campaign_id = ?', [campaign_status, campaign_id], function(error) {
            if (error) console.log(error)
        })
    },

    getAllCompletedCampaignCardInformation: () => {
        return new Promise((resolve, reject) => {
            let data = []

            //get note information
            db.query(`SELECT * FROM campaigns WHERE campaign_status = 'completed'`, function(error, results) {
                if (error) { return reject(error) }

                if (results.length === 0) { 
                    return resolve(null) 
                }

                var pending = results.length //used as an index, return function called when this reaches 0

                results.forEach(element => {
                    //get username
                    userController.getUserFromID(element.user_id).then(function(result, error) {
                        if (error) throw (error)

                        if (result) {
                            //create new data entry and append to data array
                            data.push({ createdAt: element.createdAt, filename: element.filename, campaign_id: element.campaign_id, user_id: element.user_id, campaign_status: element.campaign_status, name: element.campaign_name, username: result.username, email: result.email })

                            //check if getUserFromID needs to run any more times, and call return function accordingly
                            if (--pending === 0) {
                                return resolve(data);
                            }
                        }
                    });
                });
            })
        })
    },

    approveCampaign: async (req, res) => {
        const user_id = req.body.user_id;
        const noOfRecipients = req.body.recipients;
        const campaign_id = req.body.campaign_id;

        console.log(req.body)

        //check user has enough credits
        const customer = await userController.getUserFromID(user_id)

        if (customer.credits > noOfRecipients * 5) {
            //update recipents record in database
            db.query(`UPDATE campaigns SET recipients = ?, campaign_status = 'approved' WHERE campaign_id = ?`, [noOfRecipients, campaign_id], function(err) {
                if (err) throw err;
            });

            //deduct credits from user
            db.query('UPDATE users SET credits = credits - ? WHERE user_id = ?', [noOfRecipients * 5, user_id], function(err) {
                if (err) throw err;
                
                //send user a notification
                userController.createNotification(user_id, 'Campaign Approved', 'Your campaign: ' + req.body.campaign_name + ' has been approved.');

                res.redirect('/admin');
            });
        } else {
            res.send('User does not have enough credits for this many recipents. (credits required: ' + noOfRecipients * 5 + ', credit balance: ' + customer.credits)
        }
    },

    readTotalSubscriptions: () => {
        return new Promise((resolve, reject) => {
            fs.readFile("./stats/total_subscriptions", function(err, buf) {
                if (err) { return reject(err) }

                return (resolve(buf))
            })
        })
    },

    updateTotalSubscriptions: (num) => {
        var data = fs.readFile("./stats/total_subscriptions", function(err, buf) {
            if (err) { throw err }

            return buf.readInt8 + num
        })

        console.log(data)

        fs.writeFile("./stats/total_subscriptions", data.toString(), function(err) {
            if (err) throw err
        })
    },
}