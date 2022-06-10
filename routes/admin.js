const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.post('/updateNote', function(req, res) {
    adminController.updateNoteStatus(req.body.note_id, req.body.note_status)

    res.redirect('/admin')
})

router.post('/updateCampaign', function(req, res) {
    adminController.updateCampaignStatus(req.body.campaign_id, req.body.campaign_status)

    res.redirect('/admin')
})

router.post('/approve_campaign', function(req, res) {
    adminController.approveCampaign(req, res)
})

module.exports = router
