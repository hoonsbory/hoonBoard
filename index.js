const express = require('express');
const app = express.Router();
app.route('/', (req, res) => {
    var user_info = null;
    if(!req.user){
        user_info = [];
    }else{
        user_info = JSON.parse(JSON.stringify(req.user));
    }
    res.json(user_info);
  })

module.exports = app