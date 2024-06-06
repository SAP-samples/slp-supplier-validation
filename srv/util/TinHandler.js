"use strict";

//libraries
const cds = require("@sap/cds");
const { default: axios } = require("axios");
const { convertXMLtoJSON , generateUniqueRandomNumber, zeroPad } = require("../helpers/XML2JSON");
const { createErrorLogs } = require("../queries/EventLogs");
const logger = require("./logger");


async function ValidateTIN(TINData) {

 // Use Any thirdparty Tax Identification Number validation of your choice

 
}

module.exports = {
  ValidateTIN
};
