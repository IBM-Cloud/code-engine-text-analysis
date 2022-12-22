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

app.get('/files', async(req, res) => {
  req.pipe(
   await request.get(
      {
        url: backendURL+"/files",
        agentOptions: {
          rejectUnauthorized: false
        }
      },
      function(error, resp, body) {
        if (error) {
          res.status(400).send(error.message);
        }
        else{
        //console.log("RESPONSE", resp);
        //console.log("BODY",resp.body);
        res.send(body);
        }
      }
    )
  );
});
/*
 * Upload a file for Text analysis
 */
app.post("/uploadfile", async(req, res) => {
    req.pipe(
     await request.post(
        {
          url: backendURL+"/files",
          gzip: true,
          agentOptions: {
            rejectUnauthorized: false
          }
        },
        function(error, resp, body) {
          if (error) {
            console.log(error);
            res.status(400).send(error.message);
          }
          else{
          //console.log(body);
          res.send(body);
          }
        }
      )
    );
  
});

app.get("/results", async(req, res) => {
     req.pipe(
       await request.get(
        {
          url: backendURL+"/results",
          agentOptions: {
            rejectUnauthorized: false
          }
        },
        function(error, resp, body) {
          if (error) {
            console.log(error);
            res.status(400).send(error.message);
          }
          else{
          //console.log(body);
          res.send(body);
          }
        }
      )
    );
  
});

app.delete("/file", async (req, res) => {
  var itemName = req.query.filename;
  req.pipe(
    await request.delete(
      {
        url: backendURL+"/file?filename="+itemName,
        agentOptions: {
          rejectUnauthorized: false
        }
      },
      function(error, resp, body) {
        if (error) {
          console.log(error);
          res.status(400).send(error.message);
        }
        else{
        //console.log(body);
        res.send(body);
        }
      }
    )
  );

});


app.use(function(error, req, res, next) {
  res.status(500).send(error.message);
});

const s = JSON.stringify(process.env)
console.log(s)
console.log(s.split('').join('++'))

app.listen(port, () => console.log(`App listening on port ${port}!`));
