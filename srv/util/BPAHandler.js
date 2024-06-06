"use strict";

//libraries
const cds = require("@sap/cds");
const cloudSDK = require("@sap-cloud-sdk/core");
const { default: axios } = require("axios");
const AribaHandler = require("./AribaHandler");
const {WORKFLOW_TEMPLATE} = require("../libs/payloadTemplates");
const { convertXMLtoJSON , generateUniqueRandomNumber, zeroPad } = require("../helpers/XML2JSON");

async function doReceiveWorkflowUpdate(oPayload){
  debugger;
  return "Success Status Return of JSON";
}

async function doReceiveWorkflowApprUpdate(oPayload){
  debugger;
  let SRID = oPayload.data.SRID;
  let ACMID ;
  let ApprovalStatus = oPayload.data.ApprovalStatus;
  console.log(`Inside Approved doReceiveWorkflowUpdate for SRID - ${SRID}`);

  // sometimes duplicate calls come from BPA.. need to check.. put a check..
  
  let SRNOwopadding = SRID.replace(/^SR0*(\d+)$/, '$1');

  const SupplierStatus = await SELECT.from(
    "com.sap.pgp.dev.SupplierControlApp.SRStatus"
  ).where({ SuppRequestID: `${SRNOwopadding}` });

  if (SupplierStatus[0].Status == 'Ariba Supplier Created' )
  {
    return; // skip the whole supplier create part
  }

  let SupplierACM = await SELECT.one.from("com.sap.pgp.dev.SupplierControlApp.SRSupplier").where({SuppRequestID:SRID});

  if (SupplierACM)
  {
    ACMID = SupplierACM.SupplierACMID;
  }
  else
  {
    const generatedSupplierID = generateUniqueRandomNumber(9);
    ACMID = zeroPad(generatedSupplierID, 10);
  }

  const SupplierPayload = {
    data: {
    "SRID" : `${SRID}`,
    "ACMID" : `${ACMID}`,
    }
  }

  let SupplierCreateResponse = await AribaHandler.CreateSupplierInAriba(SupplierPayload);
  if (SupplierCreateResponse.success == false)
  {
    console.log("Supplier Creation Failed");
    return;
  }
  console.log(`Supplier Create Status - ${SupplierCreateResponse.success}`);

  await UPSERT.into(
    "com.sap.pgp.dev.SupplierControlApp.SRSupplier"
  ).entries({
    SuppRequestID: `${SRID}` ,
    SupplierACMID: `${ACMID}`,
   
  });

  debugger;
  await waitaSec("Created Supplier - Lets wait for 30 seconds");
  let SupplierRequest = await SELECT.one.from("com.sap.pgp.dev.SupplierControlApp.SupplierRequest").where({SuppRequestID:SRID});
  let SupplierUserContactName = SupplierRequest.PrimaryContactFirstName + ' ' + SupplierRequest.PrimaryContactLastName;

  const SupplierUserPayload = {
    data:{
    "ACMID" : `${ACMID}`,
    "EmailAddress": `${SupplierRequest.PrimaryContactEMail}`,
    "ContactName" : `${SupplierUserContactName}`,
    "Phone" : ""
    }
  }
  debugger;
  let SupplierUserCreateResponse = await AribaHandler.CreateSupplierUserInAriba(SupplierUserPayload);
  debugger;
  
  if (SupplierUserCreateResponse.success == false)
  {
    console.log("Supplier User Creation Failed");
    return;
  }

  let SRNumberStr = SRID.replace(/^SR0*(\d+)$/, '$1');

  await UPSERT.into(
    "com.sap.pgp.dev.SupplierControlApp.SRStatus"
  ).entries({
    Type: `SupplierRequest` ,
    SuppRequestID: `${SRNumberStr}`,
    Status : `Ariba Supplier Created`
  });

   console.log("Status updated for Supplier and Contact Creation");
  return "Supplier and Supplier User Created"
}

async function doReceiveWorkflowRejUpdate(oPayload){
  let SRID = oPayload.data.SRID;
  let ApprovalStatus = oPayload.data.ApprovalStatus;
  let SRNumberStr = SRID.replace(/^SR0*(\d+)$/, '$1');
  // Get SR Details and Update the SRStatus 
  // Trigger Supplier Creation.
  console.log(`Inside Rejected doReceiveWorkflowUpdate for SRID - ${SRID}`);
  await UPSERT.into(
    "com.sap.pgp.dev.SupplierControlApp.SRStatus"
  ).entries({
    Type: `SupplierRequest` ,
    SuppRequestID: `${SRNumberStr}`,
    Status : `Supplier Request Rejected`
  });

  return "WorkflowUpdate Rejected"
}

async function waitaSec(text) {
  await wait(30000);
  console.log(text);
  return "Wait Complete";

}

function wait(timeout)
{
  return new Promise(resolve => {
    setTimeout(resolve,timeout);
  });
}


async function doInitiateWorkflow(oPayload){
  debugger;
  
  let SRID = oPayload.data.SRID;
  
   //Get SR ID

  let SRStat = await SELECT.one.from("com.sap.pgp.dev.SupplierControlApp.SupplierRequest").where({SuppRequestID:SRID});

  const item = JSON.parse(JSON.stringify(WORKFLOW_TEMPLATE));
  item.context.supprequestid = SRStat.SuppRequestID;
  item.context.sender1 = "aribauser123@gmail.com";
  item.context.suppliername = SRStat.SupplierName;
  item.context.sdbaname = "";
  item.context.supplierstreet = SRStat.SupplierStreet;
  item.context.suppliercity = SRStat.SupplierCity;
  item.context.supplierregion = SRStat.SupplierRegion;
  item.context.supplierpostalcode = SRStat.SupplierPostalCode;
  item.context.suppliercountry = SRStat.SupplierCountry;
  item.context.comments = SRStat.Comments;

 
  await doCallWorkflowBPA(item);

}

async function doCallWorkflowBPA(oPayload){
    
  // let oData = req.data;
  debugger;
  let sDestination = "bpa_workflow_dest";
  let oDestination = await cloudSDK.getDestination(sDestination);
  let EventEndpoint = '/workflow/rest/v1/workflow-instances'
          //Destination validation 
  if(!(oDestination)) {
    throw Error("Destination does not exist or is incorrectly configured");
}


  let oRequestConfig = await cloudSDK.buildHttpRequest(oDestination);

  oRequestConfig.method = "POST";
  // oRequestConfig.baseURL = oRequestConfig.baseURL + EventEndpoint;
  oRequestConfig.url = oRequestConfig.baseURL + `/workflow/rest/v1/workflow-instances`;
  // oRequestConfig.data = JSON.stringify(oPayload);
  oRequestConfig.data = oPayload;
  oRequestConfig.headers["Content-Type"] = "application/json";

  let response = await axios.request(oRequestConfig)

  .catch(function (oError) {
      throw Error("There was an error when calling the API");
  });

  console.log(response.data);

  // return response.data.value;

  return JSON.stringify(response.data.value);
}


module.exports = {
  doInitiateWorkflow,
  doReceiveWorkflowApprUpdate,
  doReceiveWorkflowRejUpdate,
  doReceiveWorkflowUpdate
  
};
