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


function getCosClient(){
    var config = {
  endpoint:
    process.env.COS_ENDPOINT ||
    "s3.us-south.cloud-object-storage.appdomain.cloud",
  apiKeyId: process.env.COS_APIKEY,
  ibmAuthEndpoint: "https://iam.cloud.ibm.com/identity/token",
  serviceInstanceId: process.env.COS_RESOURCE_INSTANCE_ID,
};

var cosClient = new myCOS.S3(config);
return cosClient;
}

// To upload files to Cloud Object Storage
function uploadFilesToCOS(req, res, next) {
var upload = multer({
  storage: multerS3({
    s3: getCosClient(),
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

function getBucketContents(req, res, next) {
    let cos = getCosClient();
    let bucketName = process.env.COS_BUCKETNAME;
    var resultDict = {};
    var result;
    console.log(`Retrieving bucket contents from: ${bucketName}`);
    return cos.listObjects(
        {Bucket: bucketName,
        Prefix: 'results'},
    ).promise()
    .then(async (data) => {
        if (data != null && data.Contents != null) {
            for (var i = 0; i < data.Contents.length; i++) {
                var itemKey = data.Contents[i].Key;
                var itemSize = data.Contents[i].Size;
                console.log(`Item: ${itemKey} (${itemSize} bytes).`)
                result = await getItem(bucketName, itemKey);
                resultDict[itemKey] = result;
            }
            res.send(resultDict);
        }    
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
    
}

function getItem(bucketName, itemName) {
    let cos = getCosClient();
    let result;
    console.log(`Retrieving item from bucket: ${bucketName}, key: ${itemName}`);
    return cos.getObject({
        Bucket: bucketName, 
        Key: itemName
    }).promise()
    .then((data) => {
        if (data != null) {
            //console.log('File Contents: ' + Buffer.from(data.Body).toString());
            return JSON.parse(data.Body);
        }    
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}
/*
 * Default route for the web app
 */
app.get("/", function (req, res) {
  res.send("Hello World! from backend");
});
/*
 * Upload an image for Image classification
 */
app.post("/images", uploadFilesToCOS, function(req, res, next) {
  next();
});

app.post("/results", getBucketContents, function(req, res, next) {
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
