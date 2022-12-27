"use strict";
const myCOS = require("ibm-cos-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const express = require("express");
const app = express();
const path = require("path");
var atob = require("atob");
require("dotenv").config({
  silent: true,
});

const cors = require("cors");
app.use(cors());

const port = process.env.PORT || 3001;
/**
 *Define Cloud OBject Storage client configuration
 *
 * @return {*} cosCLient
 */
function getCosClient() {
  var config = {
    endpoint:
      process.env.COS_ENDPOINT ||
      "s3.us-south.cloud-object-storage.appdomain.cloud",
    apiKeyId: process.env.COS_APIKEY,
    ibmAuthEndpoint: "https://iam.cloud.ibm.com/identity/token",
    serviceInstanceId: process.env.COS_RESOURCE_INSTANCE_ID,
  };

  //console.log(process.env);
  var cosClient = new myCOS.S3(config);
  return cosClient;
}

/**
 * Upload files to COS Bucket
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function uploadFilesToCOS(req, res, next) {
  var upload = multer({
    storage: multerS3({
      s3: getCosClient(),
      bucket: process.env.COS_BUCKETNAME + "/files",
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
      return next(err);
    }
    if (req.files.length === 0) {
      return res.send("Upload a text file...");
    } else if (req.files.length > 1) {
      return res.send(
        "Successfully uploaded " + req.files.length + " files to Object Storage"
      );
    } else {
      return res.send(
        "Successfully uploaded " + req.files.length + " file to Object Storage"
      );
    }
  });
}
/**
 *Get COS bucket contents (files)
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @param {*} prefix
 * @return {*} result dictionary
 */
async function getBucketContents(req, res, next, prefix) {
  try {
    let cos = getCosClient();
    let bucketName = process.env.COS_BUCKETNAME;
    console.log(`Retrieving bucket contents from: ${bucketName}`);

    const data = await cos
      .listObjects({
        Bucket: bucketName,
        Prefix: prefix,
      })
      .promise();
    if (data != null && data.Contents != null) {
      let arrayOfDict=[];
      let finalArray = data.Contents.map(async (value) => {
        let resultDict = {};
        var itemKey = value.Key;
        var itemSize = value.Size;
        console.log(`Item: ${itemKey} (${itemSize} bytes).`);
        let result = await getItem(bucketName, itemKey, prefix);
        let fileKey = itemKey.split('/')[1];
        if (prefix === "results") {
          let str = result;
          resultDict[fileKey] = JSON.parse(str);
          resultDict["time"] = value.LastModified;

        } else {
          let str = result.substring(0, 150) + "...";
          resultDict[fileKey] = str;
          resultDict["time"] = value.LastModified;
        }
        arrayOfDict.push(resultDict);
      });
      
      // resolving all promises
      await Promise.all(finalArray);
      let arrayResult = arrayOfDict.sort((a,b)=>{ return new Date(a.time)-new Date(b.time)});
      let finalDict = {};
      let _ = arrayResult.map((value) => {
         finalDict[Object.keys(value)[0]] = Object.values(value)[0];
      });
      return finalDict;
    }
  } catch (e) {
    console.error(`ERROR: ${e.code} - ${e.message}\n`);
    return next(e.message);
  }
}
/**
 * Get each item in a COS Bucket
 *
 * @param {*} bucketName
 * @param {*} itemName
 * @param {*} prefix
 * @return {*}
 */
async function getItem(bucketName, itemName, prefix) {
  let cos = getCosClient();
  console.log(`Retrieving item from bucket: ${bucketName}, key: ${itemName}`);
  try {
    const data = await cos
      .getObject({
        Bucket: bucketName,
        Key: itemName,
      })
      .promise();
    if (data != null) {
      let buffer = Buffer.from(data.Body).toString();
      return buffer;
    }
  } catch (e) {
    console.error(`ERROR: ${e.code} - ${e.message}\n`);
  }
}

async function deleteItem(req, res, next, fileName, prefix) {
  let cos = getCosClient();
  let bucketname = process.env.COS_BUCKETNAME;
  let itemName = prefix + "/" + fileName;
  console.log(`Deleting item: ${itemName}`);
  try {
    await cos
      .deleteObject({
        Bucket: bucketname,
        Key: itemName,
      })
      .promise()
    console.log(`Item: ${itemName} deleted!`);
    return `Item: ${itemName} deleted!`;
  } catch (e) {
    console.error(`ERROR: ${e.code} - ${e.message}\n`);
  }
}

/*
 * Default route for the web app
 */
app.get("/", function (req, res, next) {
  res.send("Hello World! from backend");
});

app.get("/files", async (req, res, next) => {
  try {
    let result = await getBucketContents(req, res, next, "files");
    res.send(result);
  } catch (error) {
    // Passes errors into the error handler
    return next(error);
  }
});
/*
 * Upload a file for Text analysis
 */
app.post("/files", uploadFilesToCOS, function (req, res, next) {});

/**
 * Get the JSON from the results folder of COS Bucket
 */
app.get("/results", async (req, res, next) => {
  try {
    let result = await getBucketContents(req, res, next, "results");
    res.send(result);
  } catch (error) {
    // Passes errors into the error handler
    console.log(error);
    return next(error);
  }
});

/**
 * Delete an item from the COS Bucket
 */
app.delete("/file", async (req, res, next) => {
  var itemName = req.query.filename;
  console.log(itemName);
  let deleteFile = await deleteItem(req, res, next, itemName, "files");
  let deleteResult = await deleteItem(req,res,next, itemName,"results");
  await Promise.all([deleteFile , deleteResult]);
  res.send(`Item: ${itemName} deleted!`);
});

/**
 * Middleware to handle not supported routes
 */
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

// error handler middleware
app.use((error, req, res, next) => {
  console.log(error);
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error || "Internal Server error",
    },
  });
});

app.listen(port, () => console.log(`version 1.1 App listening on port ${port}!`));
