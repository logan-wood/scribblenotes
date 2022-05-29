const { count } = require("console");
const { getSystemErrorMap } = require("util");
const db = require("../db");
const userController = require('./userController');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.newNote = (req, res) => {

    //local variable
    const file = req.files.csv;
    const note_name = req.body.name;
    const user_id = req.user.id;

    //handle no file upload
    if(!req.files) return res.status(400).send('No files were uploaded')

    //UPDATE TO CSV MIMETYPE
    if (file.mimetype === 'text/csv') {

        //check user has enough credits
        if (req.user.credits >= 5) {
        //insert into db
            let note_id;
            db.query(`INSERT INTO notes SET ?`, {filename: req.files.csv.name, user_id: user_id, note_status: 'pending', note_name: note_name }, function(err, result) {
                if (err) throw err;
                
                // rename file to format 'note*id*_user*id*
                note_id = result.insertId
                const new_filename = 'note' + note_id + '_user' + user_id + '.csv'

                //update in DB
                db.query('UPDATE notes SET filename = ? WHERE note_id = ?', [ new_filename, note_id ], function(err) {
                    if (err) throw err;

                    //move to uploads folder
                    file.mv('./uploads/notes_files/' + new_filename, (err) => {
                        if (err) {
                            console.log(err);
                            res.redirect('/');
                            return res.status(500);
                        }

                        //create notification before ending function
                        userController.createNotification(user_id, "New Note", "New note has been sent to our team for approval.");
                                            
                        res.redirect('/');
                    });
                });
            });
        } else {
            res.status(400).send("Not enough credits")
        }

    } else {
        res.status(400).send("Please upload CSV filetype");
    }
}

//csv automatically generated
exports.newNoteAutoGen = (req, res) => {
    const { name, address, state, country, postcode, message } = req.body;

    //first, save recipent to database
    db.query('INSERT into RECIPIENTS SET ?', {user_id: req.user.id, name: name, address: address, state: state, country: country, postcode: postcode }, function(err) {
        if (err) throw err
    });

    //next, create a CSV file
    const csvWriter = createCsvWriter({
        path: 'uploads\\notes_files\\autogen\\testcsv.csv',
        header: [
            {id: 'name', title: 'Name'},
            {id: 'address', title: 'Address'}
        ]
    });

    const records = [
        {name: name, address: address}
    ];

    csvWriter.writeRecords(records)
        .then(() => {
            console.log('File has been written')
        })

    res.redirect('/')
}

exports.newCampaign = (req, res) => {

    //local variable
    const file = req.files.csv;
    const campaign_name = req.body.name;
    const user_id = req.user.id;

    //handle no file upload
    if(!req.files) return res.status(400).send('No files were uploaded')

    //check if email exists
    if (!user_id) {
        return res.send('No user logged in. (this may be a bug)')
    }

    if (file.mimetype === 'text/csv') {


        //insert into db
        let campaign_id;
        db.query(`INSERT INTO campaigns SET ?`, {filename: req.files.csv.name, user_id: user_id, campaign_status: 'pending', campaign_name: campaign_name }, function(err, result) {
            if (err) throw err;
            
            // rename file to format 'note*id*_user*id*
            campaign_id = result.insertId
            const new_filename = 'campaign' + campaign_id + '_user' + user_id + '.csv'

            //update in DB
            db.query('UPDATE campaigns SET filename = ? WHERE campaign_id = ?', [ new_filename, campaign_id ], function(err) {
                if (err) throw err;

                //move to uploads folder
                file.mv('./uploads/campaign_files/' + new_filename, (err) => {
                    if (err) {
                        console.log(err);
                        res.redirect('/');
                        return res.status(500);
                    }

                    //create notification before ending function
                    userController.createNotification(user_id, "New Campaign", "New campaign has been sent to our team for approval.");
                                        
                    res.redirect('/');
                });
            });
        });

    } else {
        res.send("Please upload CSV filetype");
    }
}