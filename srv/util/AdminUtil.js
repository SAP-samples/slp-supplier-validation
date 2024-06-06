"use strict";

//libraries
const cds = require("@sap/cds");
const xsenv = require("@sap/xsenv");
const cloudSDK = require("@sap-cloud-sdk/core");
const { default: axios } = require("axios");
const { v4: uuidv4 } = require("uuid");
const logger = require("./logger");
const { lchown } = require("fs");

xsenv.loadEnv();

async function doGetUserInformation(req) {
  try {
    let userDetails = {};

    if (req.user) {
      userDetails.id = req.user.id;

      // Get all roles of the user
      if (req.user.roles) {
        userDetails.roles = req.user.roles;
      }

      // Get all scopes of the user
      if (req.user.scopes) {
        userDetails.scopes = req.user.scopes;
      }
    }

    console.log("User Details:", userDetails);
    logger.info("User Details:", userDetails);

    return JSON.stringify(userDetails);
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function doGetSessionTime() {
  try {
    const SESSION_TIME = process.env.SESSION_TIME;
    return SESSION_TIME;
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}


module.exports = {
  doGetUserInformation,
  doGetSessionTime,

};
