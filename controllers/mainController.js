const db = require("../db");
const mysql = require('mysql');

exports.fileUpload = (req, res) => {

    //local variable
    const file = req.files.csv;
    const note_name = req.body.name;
    const user_id = req.user.id;

    //handle no file upload
    if(!req.files) return res.status(400).send('No files were uploaded')

    //check if email exists
    if (!user_id) {
        return res.send('No user logged in. (this may be a bug)')
    }

    //UPDATE TO CSV MIMETYPE
    if (file.mimetype === 'application/vnd.ms-excel') {


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
                                        
                    res.redirect('/');
                });
            });
        });

    } else {
        res.send("Please upload CSV filetype");
    }
}