/*!
    @preserve

    Simple DPF server

 	@author Bruno Fanini
==================================================================================*/

const PORT = process.env.PORT || 8000;

const express = require('express');
const app = express();

// Configure webserver
//==============================================   
app.use('/', express.static(__dirname + '/'));
app.listen(PORT, function (){
    console.log('DPF Server running on *.'+PORT);
});