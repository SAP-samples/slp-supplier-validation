var convert = require("xml-js");
const fs = require("fs");

const convertXMLtoJSON = (xml) => {
  var converted = convert.xml2json(xml, { compact: true, spaces: 4 });
  converted = JSON.parse(converted);

  return converted;
};

const generateUniqueRandomNumber = (length) => {
  const prefix = "SCT_";
  const uniqueRandomNumber = Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  );
  return prefix + uniqueRandomNumber;
};

const generateUniqueRandomEmail = (length) => {
  const prefix = "E_";
  const uniqueRandomNumber = Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  );
  return prefix + uniqueRandomNumber+'@dntariba.com';
};
const zeroPad = (num, places) => {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
};

module.exports = {
  convertXMLtoJSON,
  generateUniqueRandomNumber,
  generateUniqueRandomEmail,
  zeroPad,
};
