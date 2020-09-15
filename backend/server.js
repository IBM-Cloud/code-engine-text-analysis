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
  apiKeyId: process.env.COS_SECRET_APIKEY,
  ibmAuthEndpoint: "https://iam.cloud.ibm.com/identity/token",
  serviceInstanceId: process.env.COS_SECRET_RESOURCE_INSTANCE_ID,
};

console.log(process.env);
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
    if (req.files.length === 0) {
      res.send(
        "Upload an image..."
      );
    }
    else if (req.files.length > 1){
    res.send(
      "Successfully uploaded " + req.files.length + " files to Object Storage"
    );
    }
    else {
      res.send(
      "Successfully uploaded " + req.files.length + " file to Object Storage"
    );
    }
  });
}

async function getBucketContents(req, res, next, prefix) {
    let cos = getCosClient();
    let bucketName = process.env.COS_BUCKETNAME;
    var resultDict = {};
    var result;
    console.log(`Retrieving bucket contents from: ${bucketName}`);
    try {
    const data = await cos.listObjects({
    Bucket: bucketName,
      Prefix: prefix
    }).promise();
    if (data != null && data.Contents != null) {
      for (var i = 0; i < data.Contents.length; i++) {
        var itemKey = data.Contents[i].Key;
        var itemSize = data.Contents[i].Size;
        console.log(`Item: ${itemKey} (${itemSize} bytes).`);
        result = await getItem(bucketName, itemKey, prefix);
        resultDict[itemKey] = result;
      }
      res.send(resultDict);
    }
  }
  catch (e) {
    console.error(`ERROR: ${e.code} - ${e.message}\n`);
  }
    
}

async function getItem(bucketName, itemName, prefix) {
    let cos = getCosClient();
    console.log(`Retrieving item from bucket: ${bucketName}, key: ${itemName}`);
    try {
    const data = await cos.getObject({
      Bucket: bucketName,
      Key: itemName
    }).promise();
    if (data != null) {
      if (prefix === "results") {
        return JSON.parse(data.Body);
      }
      else {
        /*var params = {Bucket: bucketName, Key: itemName};
var promise = cos.getSignedUrlPromise('getObject', params);
promise.then(function(url) {
  console.log('The URL is', url);
}).catch (function(err) {
  console.log('error: ', err);
});*/
        return Buffer.from(data.Body).toString("base64");
      }
    }
  }
  catch (e) {
    console.error(`ERROR: ${e.code} - ${e.message}\n`);
  }
}

async function deleteItem(req,res,next,bucketName, itemName, prefix) {
  let cos = getCosClient();
  let bucketname = process.env.COS_BUCKETNAME;
  itemName = prefix +"/"+ itemName;
  if(prefix==="results")
  {
    itemName = itemName+".json";
  }
  console.log(`Deleting item: ${itemName}`);
  try {
    await cos.deleteObject({
      Bucket: bucketname,
      Key: itemName
    }).promise();
    console.log(`Item: ${itemName} deleted!`);
    res.send(`Item: ${itemName} deleted!`);
  }
  catch (e) {
    console.error(`ERROR: ${e.code} - ${e.message}\n`);
  }
}


/*
 * Default route for the web app
 */
app.get("/", function (req, res) {
  res.send("Hello World! from backend");
});

app.get("/items", function(req,res,next){
  var prefix = req.query.prefix;
  console.log(prefix);
  getBucketContents(req,res,next,prefix);
  //next();
});
/*
 * Upload an image for Image classification
 */
app.post("/images", uploadFilesToCOS, function(req, res, next) {
  next();
});

app.post("/results", function(req, res, next) {
  getBucketContents(req,res,next,"results");
 // next();
});

app.delete("/item", function(req,res,next){
  var itemName = req.query.filename;
  console.log(itemName);
  deleteItem(req,res,next,null, itemName, "images");
  deleteItem(req,res,next,null, itemName, "results");
  //next();
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
