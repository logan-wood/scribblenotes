
const db = require("../db");
const userController = require('./userController');
// const fs = require('azure-storage-fs').blob('scribblecsvstorage', process.env.STORAGE_KEY, 'uploads');
const { randomUUID } = require("crypto");
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
const storageBlob = require('@azure/storage-blob');


exports.newNote = (req, res) => {

    //local variable
    const file = req.files.csv;
    const note_name = req.body.name;
    console.log(req.files.csv)
    const user_id = req.user.id;

    //handle no file upload
    if(!req.files) return res.status(400).send('No files were uploaded')

    //UPDATE TO CSV MIMETYPE
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {

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
exports.newNoteAutoGen = async (req, res) => {
    

    //check user has enough credits
    if (req.user.credits >= 5) {
        //check if user selected a recipient, and handle
        let { name, address, state, country, city, postcode, message, note_name } = "";
        let createRecipient = true;
        if (req.body.recipient != "none") {
            createRecipient = false

            const recipient = await userController.getRecipientById(req.body.recipient);

            name = recipient.name
            address = recipient.address
            state = recipient.state
            country = recipient.country
            city = recipient.city
            postcode = recipient.postcode

            message = req.body.message
            note_name = req.body.note_name
        } else {
           name = req.body.name
           address = req.body.address
           state = req.body.state
           country = req.body.country
           city = req.body.city
           postcode = req.body.postcode
           message = req.body.message
           note_name = req.body.note_name
        }
        const path = 'notes\\';
        

        //first, save recipent to database
        console.log(createRecipient + req.body.save_recipient)
        if (createRecipient && req.body.save_recipient == 'on') {
            db.query('INSERT into RECIPIENTS SET ?', {user_id: req.user.id, name: name, address: address, state: state, country: country, city: city, postcode: postcode }, function(err) {
                if (err) throw err
            });
        }

        //save note to database
        db.query(`INSERT INTO notes SET ?`, {filename: 'temp', user_id: req.user.id, note_status: 'pending', note_name: note_name }, function(err, result) {
            if (err) throw err;

            const note_id = result.insertId
            const filename = 'note_' + note_id + '_user_' + req.user.id + '.csv';

            //create csv file data
            const csvStringifier = createCsvStringifier({
                header: [
                    {id: 'name', title: 'name'},
                    {id: 'address', title: 'address'},
                    {id: 'state', title: 'state'},
                    {id: 'country', title: 'country'},
                    {id: 'city', title: 'city'},
                    {id: 'postcode', title: 'postcode'},
                    {id: 'message', title: 'message'}
                ]
             });
             const records = [
                 {name: name, address: address, state: state, country: country, city: city, postcode: postcode, message: message}
             ];
             
             //upload to azure     
             const headers = csvStringifier.getHeaderString();
             const data = csvStringifier.stringifyRecords(records);
             const blobData = `${headers}${data}`;
             const credentials = new storageBlob.StorageSharedKeyCredential(process.env.STORAGE_ACCOUNT_NAME, process.env.STORAGE_KEY);
             const BlobServiceClient = new storageBlob.BlobServiceClient(`https://${process.env.STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, credentials);
             const containerClient = BlobServiceClient.getContainerClient('uploads');
             const blockBlobClient = containerClient.getBlockBlobClient(filename);
             const options = {
                 blobHTTPHeaders: {
                     blobContentType: 'text/csv'
                 }
             };
             blockBlobClient.uploadData(Buffer.from(blobData), options)
             .then((result) => {
                //note uploaded
                console.log('blob uploaded successfully');
                console.log(result);

                //update filename in database
                db.query('UPDATE notes SET filename = ? WHERE note_id = ?', [ filename, note_id ], function(err) {
                    if (err) throw err;
                });

                //create notification before ending function
                userController.createNotification(req.user.id, "New Note", "New note has been sent to our team for approval.");

                res.redirect('/');
             })
             .catch((error) => {
                 //error
                 console.log('failed to upload blob');
                 console.log(error);
                 res.redirect('/')
             })
        });
            
    } else {
        res.status(400).send('Not enough credits.')
    }
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

    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {


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
                    console.log('campaign file moved')

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


// let note_id;
//                 db.query(`INSERT INTO notes SET ?`, {filename: 'temp', user_id: req.user.id, note_status: 'pending', note_name: note_name }, function(err, result) {
//                     if (err) throw err;
                    
//                     // rename file to format 'note*id*_user*id*
//                     note_id = result.insertId
//                     const new_filename = 'note' + note_id + '_user' + req.user.id + '.csv'

//                     //update in DB
//                     db.query('UPDATE notes SET filename = ? WHERE note_id = ?', [ new_filename, note_id ], function(err) {
//                         if (err) throw err;

//                         //move to uploads folder
//                         fs.rename(filename, path + new_filename, function(err) {
//                             if (err) {
//                                 console.log(err);
//                                 res.send('There was a problem uploading your file. Please try again.');
//                             }

//                             //create notification before ending function
//                             userController.createNotification(req.user.id, "New Note", "New note has been sent to our team for approval.");
                                                
//                             res.redirect('/');
//                         });
//                     });
//                 });