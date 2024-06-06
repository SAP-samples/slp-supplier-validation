"use strict";

const cds = require("@sap/cds");
const logger = require("../util/logger");
const BPAHandler = require("./BPAHandler");
const fs = require('fs');
const docusign = require("<esignaturemodules>"); //It can be any E-Signature of your choice
const moment = require("moment");

async function dogetAccessToken (req) {

  debugger;
  const basePath = 'https://<baseuri>/restapi'; //replace with baseuri
  const accountId = '<replace with accountid>';
  const userId = '<replace with GUID>'; // This is the API username (GUID)
  const oAuthBaseUrl = 'xxxx.<esignatuiredomain>.com'; //replace with baseurl
  const redirectUri = 'http://localhost:5000/ds/callback';
  const privateKeyFilename = './srv/interim/privatekey';
  const integratorKey = '<replace with cliend id>'; // Client ID
  
  try {
  // Read your private key from file
  const privateKey = fs.readFileSync(privateKeyFilename);
  
  // Create the JWT authentication object
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  apiClient.setOAuthBasePath(oAuthBaseUrl);
  
  // Set the scopes required
  const scopes = [
      "signature",
      "impersonation"
  ];
  
  // Get the JWT token
  const expiresInHours = 1; // Token expiry set to 1 hour
  const response = await apiClient.requestJWTUserToken(integratorKey, userId, scopes, privateKey, expiresInHours)
  const accessToken = response.body.access_token;
  return accessToken;

}
catch (error)
{
  console.error('Error during authentication:', error);
  throw error;
}
}

async function doDocusignAccessCode (req) {

    let oData = req.data;
    debugger;

    let Payload = req.data;
    
    var payloadstring = Payload.sPayload.toString()

    req.dsAuthJwt = new DsJwtAuth(req);
    req.dsAuth = req.dsAuthJwt;

    // 1. Validation
    if (payloadstring == 'AccessToken') {
     
        let dataP = req.dsAuth.loginddocusign(req);

        let data = await dataP;

        return data.accessToken;

    }
    else{
        logger.error("Missing mandatory fields");
        req.reject(400, "Missing mandatory fields, unable to progress");
    }


}

async function waitaSec(text) {
  await wait(5000);
  console.log(text);
  return "Wait Complete";

}

function wait(timeout)
{
  return new Promise(resolve => {
    setTimeout(resolve,timeout);
  });
}


async function doCreateEnvelope(oPayload) {
debugger;

try 
{
let SRNumber = oPayload.data.SRID;

await waitaSec("Calling DocuSign Create Envelope");

let currentsr = await SELECT.one.from("com.sap.pgp.dev.SupplierControlApp.SupplierRequest").where({SuppRequestID:SRNumber});

let SupplierName = currentsr.SupplierName;
let SignerEmail = currentsr.PrimaryContactEMail;
let SignerName = currentsr.PrimaryContactFirstName + " " + currentsr.PrimaryContactLastName;
let AccessToken = await dogetAccessToken();
const basePath = '<eisgnature basepath>/restapi'; 
const accountId = '<accountid>'; // Replace with your account ID
const accessToken = AccessToken; // Replace with a valid access token

console.log(`Create Envelope - Supplier Name ${SupplierName} ` )
console.log(`Create Envelope - Signer Email ${SignerEmail} ` )
console.log(`Create Envelope - Signer Name ${SignerName} ` )
console.log(`Create Envelope - Access Token ${accessToken} ` )

// Create a new API client and set the base path
let apiClient = new docusign.ApiClient();
apiClient.setBasePath(basePath);
apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

// Create a new envelopesApi instance
let envelopesApi = new docusign.EnvelopesApi(apiClient);

// Define the envelope request object
let envelopeDefinition = new docusign.EnvelopeDefinition();
envelopeDefinition.emailSubject = 'Please sign NDA Request !!!';
envelopeDefinition.templateId = oPayload.data.TemplateID; // e9fa0772-2737-49fa-b3e3-f5eeb69cd4c4

// Define template role(s) and assign signer(s)
let templateRole = new docusign.TemplateRole();
templateRole.roleName = 'SLP'; // Replace with the role name defined in the template
templateRole.name = SignerName; // Replace with the signer's name
templateRole.email = SignerEmail; // Replace with the signer's email


 // Define text tabs using anchor strings
 const textTab1 = new docusign.Text();
 textTab1.anchorString = '//comp//'; // Replace with your actual anchor string
 textTab1.value = SupplierName; // Replace with the text you want to insert

 
 // Add text tabs to the template role
 templateRole.tabs = new docusign.Tabs();
 templateRole.tabs.textTabs = [textTab1];


// Add the template role object to the envelope object
envelopeDefinition.templateRoles = [templateRole];
envelopeDefinition.status = 'sent'; // Set to 'sent' to send the envelope immediately

console.log("createenvelope: Calling Create Envelope function");
// Create and send the envelope
let envelopeSummary = await envelopesApi.createEnvelope(accountId, { envelopeDefinition: envelopeDefinition });

  console.log(`createenvelope: Completed Create Envelope function ${envelopeSummary.envelopeId}`);

let EnvelopeID =  envelopeSummary.envelopeId;
let DocuStatus = "Sent for Signature";

await UPSERT.into(
  "com.sap.pgp.dev.SupplierControlApp.DocuEnvelopes"
).entries({
  SuppRequestID: `${SRNumber}`,
  EnvelopeID: `${EnvelopeID}`,
  TemplateID: `${oPayload.data.TemplateID}`,
  SuppContactID: `${SignerName}`,
  SuppContactEmail: `${SignerEmail}`,
  Status: `${DocuStatus}`
});



}
catch (error)
{
  console.error('Error during DocuSign Create:', error);
  throw error;
}

}

async function doGetEnvelopeStatuses (req) {

  debugger;
  let AccessToken = await dogetAccessToken();


    if (AccessToken != null) {

        let dsApiClient = new docusign.ApiClient();
        dsApiClient.setBasePath("https://<esignaturebaseuri>/restapi");
        dsApiClient.addDefaultHeader("Authorization", "Bearer " + AccessToken);
        console.log('" Access token "' + AccessToken + '"');
        let envelopesApi = new docusign.EnvelopesApi(dsApiClient),
          results = null,
          enveloplist = '';

        console.log('" Envelope API "' + envelopesApi + '"');
        let options = { fromDate: moment().subtract(5, "days").format() };
        console.log('days options complete');
        // Exceptions will be caught by the calling function
        results = await envelopesApi.listStatusChanges("<accountid>", options);
        console.log('ListStatusChange complete' + results.envelopes[0].status);

        let srs = await SELECT.from("com.sap.pgp.dev.SupplierControlApp.DocuEnvelopes").where({Status:"Sent for Signature"});

        for(const val of results.envelopes) {

               for(let j=0;j<srs.length;j++)
               {
                if(val.envelopeId == srs[j].EnvelopeID && val.status == 'completed')
                {
                    // DocuSign moved to Completed State.. Update the DocuEnvelopes Table.

                    await UPSERT.into(
                      "com.sap.pgp.dev.SupplierControlApp.DocuEnvelopes"
                    ).entries({
                      SuppRequestID: `${srs[j].SuppRequestID}`,
                      EnvelopeID: `${srs[j].EnvelopeID}`,
                      TemplateID: `${srs[j].TemplateID}`,
                      SuppContactID: `${srs[j].SuppContactID}`,
                      SuppContactEmail: `${srs[j].SuppContactEmail}`,
                      Status: `Signature Completed`
                    });

                    let SRN1 = Number(srs[j].SuppRequestID.replace('SR',''));
                    let SRNumberStr = SRN1.toString();

                    await UPSERT.into(
                      "com.sap.pgp.dev.SupplierControlApp.SRStatus"
                    ).entries({
                      Type: `SupplierRequest` ,
                      SuppRequestID: `${SRNumberStr}`,
                      Status : `Signature Completed`
                    });


                    // Lets call SR Approval Process Now.. 
                    debugger;
                    const SRIDforWorkflow = {
                      data: {
                        SRID: `${srs[j].SuppRequestID}`
                      }
                    };
                    // SRIDforWorkflow.data.SRID = srs[j].SuppRequestID;
                    let workflow = await BPAHandler.doInitiateWorkflow(SRIDforWorkflow);


                }
               }

        }
        return enveloplist;


    }
    else{
        logger.error("Missing mandatory fields");
        req.reject(400, "Missing mandatory fields, unable to progress");
        return "error";
    }


}

async function doGetOneEnvelopeStatus (req) {

  debugger;

  let Payload = req.data;

  var accessstring = Payload.sPayload.toString()

  var envelopeid = Payload.sEnvelopeID.toString()

  if (accessstring != null) {

      let dsApiClient = new docusign.ApiClient();
      dsApiClient.setBasePath("https://<baseuri>/restapi");
      dsApiClient.addDefaultHeader("Authorization", "Bearer " + accessstring);
      console.log('" Access token "' + accessstring + '"');
      let envelopesApi = new docusign.EnvelopesApi(dsApiClient),
        results = null,
        enveloplist = '';

      console.log('" Envelope ID "' + envelopeid + '"');

      results = await envelopesApi.getEnvelope("<accountid>", envelopeid, null);

      return results.status;


  }
  else{
      logger.error("Missing mandatory fields");
      req.reject(400, "Missing mandatory fields, unable to progress");
      return "error";
  }


}

async function doGetEnvelopeAttachment (req) {

    let oData = req.data;
    debugger;

    let Payload = req.data;

    var accessstring = Payload.sPayload.toString()
    var envelopeid = Payload.sEnvelopeID.toString();


    if (accessstring != null) {

        let dsApiClient = new docusign.ApiClient();
        dsApiClient.setBasePath("https://<baseuri>/restapi"); //replace accordingly
        dsApiClient.addDefaultHeader("Authorization", "Bearer " + accessstring);
        console.log('" Access token "' + accessstring + '"');
        let envelopesApi = new docusign.EnvelopesApi(dsApiClient),
          results = null,
          enveloplist = '';

           results = await envelopesApi.listDocuments(
            '<clientid>',
            envelopeid,
            null
          );

          let results1 = await envelopesApi.getDocument(
            '<clientid>',
            envelopeid,
            '1',
            null
          );

          let docItem = results.envelopeDocuments.find(
            (item) => item.documentId === '1'
          ),
          docName = docItem.name,
          hasPDFsuffix = docName.substr(docName.length - 4).toUpperCase() === ".PDF",
          pdfFile = hasPDFsuffix;
        // Add .pdf if it's a content or summary doc and doesn't already end in .pdf
        if (
          (docItem.type === "content" || docItem.type === "summary") &&
          !hasPDFsuffix
        ) {
          docName += ".pdf";
          pdfFile = true;
        }
        // Add .zip as appropriate
        if (docItem.type === "zip") {
          docName += ".zip";
        }

        let mimetype;
        if (pdfFile) {
          mimetype = "application/pdf";
        } else if (docItem.type === "zip") {
          mimetype = "application/zip";
        } else {
          mimetype = "application/octet-stream";
        }

        return { mimetype: mimetype, docName: docName, fileBytes: results1 };

    }
    else{
        logger.error("Missing mandatory fields");
        req.reject(400, "Missing mandatory fields, unable to progress");
        return "error";
    }


}
module.exports = {
    doDocusignAccessCode,
    doGetEnvelopeAttachment,
    doGetOneEnvelopeStatus,
    doGetEnvelopeStatuses,
    dogetAccessToken,
    doCreateEnvelope
}