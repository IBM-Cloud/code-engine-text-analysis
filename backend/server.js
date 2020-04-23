"use strict";
const myCOS = require("ibm-cos-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config({
  silent: true
});

const cors = require("cors");
app.use(cors());

const port = process.env.PORT || 3001;

function uploadFilesToCOS(req, res, next) {
  var config = {
  endpoint:
    process.env.COS_ENDPOINT ||
    "s3.us-south.cloud-object-storage.appdomain.cloud",
  apiKeyId: process.env.COS_APIKEY,
  ibmAuthEndpoint: "https://iam.cloud.ibm.com/identity/token",
  serviceInstanceId: process.env.COS_RESOURCE_INSTANCE_ID,
};

var cosClient = new myCOS.S3(config);

var upload = multer({
  storage: multerS3({
    s3: cosClient,
    bucket: process.env.COS_BUCKETNAME+'/images',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
}).array("files", 10);

  upload(req, res, function (err) {
    if (err) {
      next(err);
    }
    if (req.files.length > 1) {
      res.send(
        "Successfully uploaded " + req.files.length + " files to Object Storage"
      );
    }
    else{
    res.send(
      "Successfully uploaded " + req.files.length + " file to Object Storage"
    );
    }
  });
}

/*
 * Default route for the web app
 */
app.get("/", function (req, res) {
  res.send("Hello World! from backend");
});
/*
 * Upload an image for object detection
 */
app.post("/images", uploadFilesToCOS, function(req, res, next) {
  next();
});

app.all("*", function (req, res, next) {
  var err = new Error("Route not supported. Please check your backend URL");
  next(err);
});

app.use(function (error, req, res, next) {
  console.log(error);
  res.status(500).send("Oops!! An error occurred. Check the logs for more info. This is a message from your BACKEND");
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
