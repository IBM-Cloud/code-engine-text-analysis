"use strict";
const express = require("express");
const app = express();
const request = require("request");
const path = require("path");
require("dotenv").config({
  silent: true
});
const cors = require("cors");
app.use(cors());
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/public/images'))
app.use(express.static(__dirname + '/public/css'))
const port = process.env.PORT || 3000;

const backendURL = process.env.BACKEND_URL;
console.log("backend URL: " + backendURL);

/*
 * Default route for the web app
 */
app.get('/', function(req, res) {
    if (backendURL === undefined || backendURL === ""){
// if user is not logged-in redirect back to login page //
       res.sendFile(__dirname + "/public/501.html");
    }   else{
        res.sendFile(__dirname + "/public/index.html");
    }
});
/*
 * Upload an image for object detection
 */
app.post("/uploadimage", function(req, res) {
    req.pipe(
      request.post(
        {
          url: backendURL+"/images",
          gzip: true,
          agentOptions: {
            rejectUnauthorized: false
          }
        },
        function(error, resp, body) {
          if (error) {
            res.status(400).send(error.message);
          }
          else{
          //console.log(body);
          res.send({ data: body });
          }
        }
      )
    );
  
});

app.use(function(error, req, res, next) {
  res.status(500).send(error.message);
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
