"use strict";

//libraries
const cds = require("@sap/cds");
const cloudSDK = require("@sap-cloud-sdk/core");
const { default: axios } = require("axios");
const { convertXMLtoJSON , generateUniqueRandomNumber, generateUniqueRandomEmail, zeroPad } = require("../helpers/XML2JSON");
const { doSaveSuppliersData } = require("../queries/Suppliers");
const { ValidateTIN } = require("../util/TinHandler");
const { doSupplierAddressCheck } = require("../util/SmartStreetHandler");
const { createErrorLogs } = require("../queries/EventLogs");
const logger = require("./logger");
const fuzzball = require('fuzzball');
const {PUBLISHQA_TEMPLATE} = require("../libs/payloadTemplates");



async function doSupplierNameCheckAriba(SupplierName) {
  debugger;
  let SupplierMatch = [];
  let SuppliertoCheck = SupplierName.data.SupplierName;
  debugger;
  let Suppliers = await SELECT.from("com.sap.pgp.dev.SupplierControlApp.Suppliers");
      
  for ( let i = 0; i< Suppliers.length;i++)
  {

  let matchingresults = await fuzzyCheck(SuppliertoCheck,Suppliers[i].SupplierName)
  console.log(matchingresults);
  if (matchingresults.score > 70 )
  {
    
    const supplier = 
    {
      SupplierID: Suppliers[i].ACMID,
      SupplierName: Suppliers[i].SupplierName,
      SupplierStr: Suppliers[i].SupplierStreet,
      SupplierCountry: Suppliers[i].SupplierCountry,
      MatchScore: matchingresults.score
    }
    SupplierMatch.push(supplier);
  }

  }

  return JSON.stringify(SupplierMatch);

}

async function fuzzyCheck(targetName,Sname ) {

  let score = fuzzball.ratio(targetName, Sname);

  // You can set a threshold for matching, e.g., names with a score above 70
  if (score > 50) {
      return { name: Sname, score: score};
  }
  else
  {
    return { name: Sname , score: score, message: "Not a close match"};
  }
 
}

async function CreateSupplierInAriba(supplierData) {

  debugger;

  let SRID = supplierData.data.SRID;
  let ACMID = supplierData.data.ACMID;

  let SRStat = await SELECT.one.from("com.sap.pgp.dev.SupplierControlApp.SupplierRequest").where({SuppRequestID:SRID});

  if (SRStat == undefined)
  {
    return {
      success: false,
      responseStatus: "No Supplier"
    };
  }
  // const generatedSupplierID = generateUniqueRandomNumber(9);
  // let ACMID = zeroPad(generatedSupplierID, 10);

  const payload = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Ariba:Sourcing:vrealm_350042">
  <soapenv:Header>
     <urn:Headers>
        <!--You may enter the following 2 items in any order-->
        <!--Optional:-->
        <urn:variant>vrealm_350042</urn:variant>
        <!--Optional:-->
        <urn:partition>prealm_350042</urn:partition>
     </urn:Headers>
  </soapenv:Header>
  <soapenv:Body>
     <urn:OrganizationImportRequest partition="prealm_350042" variant="vrealm_350042">
        <!--Optional:-->
        <urn:Organization_WSOrganizationImport_Item>
           <!--Zero or more repetitions:-->
           <urn:item>
              <!--You may enter the following 24 items in any order-->
              <urn:Categories>
                 <!--Zero or more repetitions:-->
                 <urn:item>
                    <!--You may enter the following 2 items in any order-->
                    <urn:Domain>unspsc</urn:Domain>
                    <urn:UniqueName>721317</urn:UniqueName>
                 </urn:item>
              </urn:Categories>
              <urn:CorporateAddress>
                 <!--You may enter the following 2 items in any order-->
                 <!--Optional:-->
                 <urn:PostalAddress>
                    <!--You may enter the following 5 items in any order-->
                    <!--Optional:-->
                    <urn:City>${SRStat.SupplierCity}</urn:City>
                    <!--Optional:-->
                    <urn:Country>
                       <!--Optional:-->
                       <urn:UniqueName>${SRStat.SupplierCountry}</urn:UniqueName>
                    </urn:Country>
                    <!--Optional:-->
                    <urn:Lines>${SRStat.SupplierStreet}</urn:Lines>
                    <!--Optional:-->
                    <urn:PostalCode>${SRStat.SupplierPostalCode}</urn:PostalCode>
                    <!--Optional:-->
                    <urn:State>${SRStat.SupplierRegion}</urn:State>
                 </urn:PostalAddress>
                 <urn:UniqueName>${SRStat.SupplierName}</urn:UniqueName>
              </urn:CorporateAddress>
              <urn:CorporateEmailAddress></urn:CorporateEmailAddress>
              <urn:IsOrgApproved>2</urn:IsOrgApproved>
              <urn:IsSupplier>true</urn:IsSupplier>
              <urn:IsCustomer>false</urn:IsCustomer>
              <urn:Name>${SRStat.SupplierName}</urn:Name>
              <!--Optional:-->
              <urn:OrganizationSource>Internal</urn:OrganizationSource>
              <!--Optional:-->
              <urn:OrganizationType>Supplier</urn:OrganizationType>
<!--Optional:-->
              <urn:PreferredCurrency>
                 <!--Optional:-->
                 <urn:UniqueName></urn:UniqueName>
              </urn:PreferredCurrency>
              <!--Optional:-->
              <urn:RegionalTIN></urn:RegionalTIN>
              <!--Optional:-->
              <urn:StateOfIncorporation>TX</urn:StateOfIncorporation>
              <!--Optional:-->
              <urn:StateTIN></urn:StateTIN>
              <urn:SystemID>${ACMID}</urn:SystemID>
              <!--Optional:-->
              <urn:UsTIN></urn:UsTIN>
              <!--Optional:-->
              <urn:VatID></urn:VatID>
           </urn:item>
        </urn:Organization_WSOrganizationImport_Item>
     </urn:OrganizationImportRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const sUrl =
    "https://s3.ariba.com/Sourcing/soap/AribaRealm/OrganizationImport";

  const oResult = await axios.post(sUrl, payload, {
    headers: {
      "Content-Type": "application/xml",
    },
    auth: {
      username: "<integrationuserid>",
      password: "<integrationpassword>",
    },
  });
  if (oResult.status == 200) {
    const responseJSON = convertXMLtoJSON(oResult.data);

    if ("soap:Envelope" in responseJSON) {
      await doSaveSuppliersData(supplierData);
      const { "soap:Envelope": soapEnvelop } = responseJSON;
      const { "soap:Body": soapBody } = soapEnvelop;
      const { UserImportReply } = soapBody;

      return {
        success: true,
        responseStatus: oResult.status,
        message: UserImportReply?.status._text,
      };
    } else {
      const { "soapenv:Body": soapEnvBody } = responseJSON;
      const { "soapenv:Fault": soapEnvFault } = soapEnvBody;
      const { Faultcode } = soapEnvFault;

    
      return {
        success: false,
        responseStatus: oResult.status,
        Faultcode: Faultcode._text,
      };
    }
  } else {
    return {
      success: false,
      responseStatus: oResult.status,
      message: oResult.error,
    };
  }
}

async function CreateSupplierUserInAriba(userData) {

  debugger;
  const generatedSupplierID = generateUniqueRandomEmail(9);
  // let SRID = supplierData.data.SRID;

  // let SRStat = await SELECT.one.from("com.sap.pgp.dev.SupplierControlApp.SupplierRequest").where({SuppRequestID:SRID});

  const payload = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Ariba:Sourcing:vrealm_350042">
  <soapenv:Header>
      <urn:Headers>
          <!--You may enter the following 2 items in any order-->
          <!--Optional:-->
          <urn:variant>vrealm_350042</urn:variant>
          <!--Optional:-->
          <urn:partition>prealm_350042</urn:partition>
      </urn:Headers>
  </soapenv:Header>
  <soapenv:Body>
      <urn:UserImportRequest partition="prealm_350042" variant="vrealm_350042">
          <!--Optional:-->
          <urn:User_WSUserImport_Item>
              <!--Zero or more repetitions:-->
              <urn:item>
                  <!--You may enter the following items in any order-->
                  <urn:BillingAddresses/>
                  <urn:ShipTos/>
                  <!--Optional:-->
                  <urn:DefaultCurrency>
                      <!--Optional:-->
                      <urn:UniqueName>EUR</urn:UniqueName>
                  </urn:DefaultCurrency>
                  <urn:EmailAddress>${userData.data.EmailAddress}</urn:EmailAddress>
                  <!--Optional:-->
                  <urn:IsEmailInviteNeeded>1</urn:IsEmailInviteNeeded>
                  <urn:IsTerminated>0</urn:IsTerminated>
                  <!--Optional:-->
                  <urn:LocaleID>
                      <!--Optional:-->
                      <urn:UniqueName>en_US</urn:UniqueName>
                  </urn:LocaleID>
                  <urn:Name>${userData.data.ContactName}</urn:Name>
                  <urn:Organization>
                      <!--You may enter the following 2 items in any order-->
                      <urn:SystemID>${userData.data.ACMID}</urn:SystemID>
                  </urn:Organization>
                  <urn:PasswordAdapter>SourcingSupplierUser</urn:PasswordAdapter>
                  <!--Optional:-->
                  <urn:Phone>${userData.data.Phone}</urn:Phone>
                  <urn:UniqueName>${generatedSupplierID}</urn:UniqueName>
              </urn:item>
          </urn:User_WSUserImport_Item>
      </urn:UserImportRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const sUrl = "https://s3.ariba.com/Sourcing/soap/AribaRealm/UserImport";

  const oResult = await axios.post(sUrl, payload, {
    headers: {
      "Content-Type": "application/xml",
    },
    auth: {
      username: "<integrationuserid>",
      password: "<integrationpassword>",
    },
  });

  if (oResult.status == 200) {
    const responseJSON = convertXMLtoJSON(oResult.data);

    if ("soap:Envelope" in responseJSON) {
      const { "soap:Envelope": soapEnvelop } = responseJSON;
      const { "soap:Body": soapBody } = soapEnvelop;
      const { UserImportReply } = soapBody;

      return {
        success: true,
        responseStatus: oResult.status,
        message: UserImportReply?.status._text,
      };
    } else {
      const { "soapenv:Body": soapEnvBody } = responseJSON;
      const { "soapenv:Fault": soapEnvFault } = soapEnvBody;
      const { Faultcode } = soapEnvFault;

      return {
        success: false,
        responseStatus: oResult.status,
        Faultcode: Faultcode._text,
      };
    }
  } else {
        return {
      success: false,
      responseStatus: oResult.status,
      message: oResult.error,
    };
  }
}

async function UpdateExternalValidationinAriba(SMID,DocID,oPayload) {

  // Get Workspace Details and Document Details for Registration and Validation

  debugger;
 let realm = 'AribaRealm';
 let oDestination;
 oDestination = await cloudSDK.getDestination("supplierpagination-sandmedio");
 let EventEndpoint = `/vendors/${SMID}/workspaces/questionnaires/${DocID}/answers`;
 
 //Destination validation 
 if(!(oDestination) || !(oDestination.originalProperties.destinationConfiguration.apikey)) {
     logger.error(`Destination does not exist or is incorrectly configured`);
     throw Error("Destination does not exist or is incorrectly configured");
 }

 //building request  
 let oRequestConfig = await cloudSDK.buildHttpRequest(oDestination);
 oRequestConfig.baseURL = oRequestConfig.baseURL + EventEndpoint;
 oRequestConfig.method = "POST";
 
 oRequestConfig.params = {
                          realm:realm                          
                         };

 oRequestConfig.headers["Accept"]=oRequestConfig.headers["Content-Type"]="application/json";
 oRequestConfig.headers["apikey"]=oDestination.originalProperties.destinationConfiguration.apikey;
 
 oRequestConfig.data = oPayload;
 console.log(`Request URL ${oRequestConfig.baseURL}`);

//  console.log(`Request Body ${oRequestConfig.data}`);

         try{
             debugger;
             console.log("Aribaeventhandler: Updating Pagination API");
             let response = await axios.request(oRequestConfig);
             console.log("Aribaeventhandler: Completed Updating Pagination API");
             debugger;
            }
         catch(error){
      
          console.log(`Error while processing API call Update Pagination: ${error} `);
          return `Error`
      }


}

async function ProcessPendingValidations() {

 debugger;
 let realm = 'AribaRealm';
 let oDestination;
 oDestination = await cloudSDK.getDestination("external-approval-sourcing-sandmedio");
 let EventEndpoint = `/pendingApprovables`;
 
 //Destination validation 
 if(!(oDestination) || !(oDestination.originalProperties.destinationConfiguration.apikey)) {
     logger.error(`Destination does not exist or is incorrectly configured`);
     throw Error("Destination does not exist or is incorrectly configured");
 }

 //building request  
 let oRequestConfig = await cloudSDK.buildHttpRequest(oDestination);
 oRequestConfig.baseURL = oRequestConfig.baseURL + EventEndpoint;
 oRequestConfig.method = "get";
 
 oRequestConfig.params = {
                          realm:realm ,
                          user:'gramachandran',
                          passwordAdapter:'PasswordAdapter1'
                         };

 oRequestConfig.headers["Accept"]=oRequestConfig.headers["Content-Type"]="application/json";
 oRequestConfig.headers["apikey"]=oDestination.originalProperties.destinationConfiguration.apikey;
 
//  oRequestConfig.data = oPayload;
 console.log(`Request URL ${oRequestConfig.baseURL}`);

//  console.log(`Request Body ${oRequestConfig.data}`);

         try{
             debugger;
             console.log("Aribaeventhandler: Getting Pending Approvabls");
             let response = await axios.request(oRequestConfig);
             const filteredData = response.data.filter(item => item.description == 'Approval for supplier registration');

             for (const item of filteredData)
             {

              let ApprovalPost = {};
              let TaskID = item.uniqueName;
              console.log(`Task ID: ${TaskID}`);
              
              oRequestConfig.baseURL = 'https://openapi.ariba.com/api/sourcing-approval/v2/prod/Task/' + TaskID;
              oRequestConfig.method = "get";
              
              oRequestConfig.params = {
                                       realm:realm 
                                      };
             
              oRequestConfig.headers["Accept"]=oRequestConfig.headers["Content-Type"]="application/json";
              oRequestConfig.headers["apikey"]=oDestination.originalProperties.destinationConfiguration.apikey;

              console.log(`Request URL for Task ${oRequestConfig.baseURL}`);
              console.log("Aribaeventhandler: Getting Task Details");
              let taskresponse = await axios.request(oRequestConfig);
              console.log(`Completed response to get task details ${taskresponse.data}`);
              let lv_found = false;
              debugger;
              taskresponse.data.approvalRequests.forEach(element => {
                if (element.approvers[0].group.uniqueName == 'Supplier Control Tower' && element.approvalState == 'Ready for approval')
                {
                  lv_found = true;
                }
                
              });
              
              if ( lv_found == true )
              {
                // Good to Process.. now get the Workspace ID and the Registration Inforamtion

                // Insert the Task ID to database table so that this is getting processed now.. 
                let WorkspaceID = taskresponse.data.workspaceId;
                let SRGAddrinput = '';
                let SRGOFACinput = '';
                let srgdandbinput = '';
                let SRGtininput = '';
                let SRGeininput = '';
                let extcorrtocheck = [];
                let TINIDAnswer = '';
                let TINNameAnswer = '';
                let SupplierCity = '';
                let SupplierCountry = '';
                let SupplierPostalCode = '';
                let SupplierState = '';
                let SupplierStreet = '';


                const ExtCorr = await SELECT.from(
                  "com.sap.pgp.dev.SupplierControlApp.ValidationControls"
                ).where({ Realm: `AribaRealm` });

                if (ExtCorr.length != 0)
                {
                SRGAddrinput = ExtCorr[0].SRGAddrinput;
                if(SRGAddrinput)
                {
                  extcorrtocheck.push(SRGAddrinput);
                }
                

                SRGOFACinput = ExtCorr[0].SRGOFACinput;
                if (SRGOFACinput)
                {
                  extcorrtocheck.push(SRGOFACinput);
                }
                

                srgdandbinput = ExtCorr[0].srgdandbinput;
                if(srgdandbinput)
                {
                  extcorrtocheck.push(srgdandbinput);
                }
                

                SRGtininput = ExtCorr[0].SRGtininput;
                if(SRGtininput)
                {
                  //Split Tax ID and name into separate arrays
                  let tinparts = SRGtininput.split(';');
                  // for (let j=0;j<tinparts.length;j++)
                  // {
                  //   extcorrtocheck.push(tinparts[j]);
                  // }

                  extcorrtocheck.push(...tinparts);
                }
                

                SRGeininput = ExtCorr[0].SRGeininput;
                if(SRGeininput)
                {
                  extcorrtocheck.push(SRGeininput);
                }
                
                  
                }
                else
                {
                  return;
                }

         

                // for ( let i=0;i<taskresponse.data.document.content.answers.length;i++)
                // {
                  // console.log(taskresponse.data.document.content.answers[i]);
                  // Read the Database to find the Active External Correlation ID and then start collecting the registration data array..
                  let TINRequest = {}, AddressRequest = {} ,  AddressResponse = {} , TINResponse = {} , AddressResponseFinal, AddressResponseFinalCode, TINFinalResponse , TINFinalResponseCode;

                  let matchingrRows = taskresponse.data.document.content.answers.filter(item=>extcorrtocheck.includes(item.externalSystemCorrelationId))

                  if (matchingrRows)
                  {

                    for ( let k=0;k<matchingrRows.length;k++)
                    {

                      if (matchingrRows[k].answerType == 'Address')
                      {

                        SupplierCity = matchingrRows[k].addressAnswer.city;
                        SupplierCountry = matchingrRows[k].addressAnswer.countryCode;
                        SupplierPostalCode = matchingrRows[k].addressAnswer.postalCode;
                        SupplierState = matchingrRows[k].addressAnswer.state;
                        SupplierStreet = matchingrRows[k].addressAnswer.street;

                      }

                      if (matchingrRows[k].questionLabel == 'Tax Provider Last Name')
                      {

                      
                       TINNameAnswer = matchingrRows[k].answer;

                      }

                      if (matchingrRows[k].questionLabel == 'Tax Identification Number')
                      {
                        TINIDAnswer = matchingrRows[k].answer;
                
                      }


                    }

                  }

                

                  if (TINIDAnswer)
                  {
                    // call Tax ID Handler
                    TINRequest = {
                      data: {
                      "TINID" : TINIDAnswer,
                      "TINName": TINNameAnswer,
                      "CheckType": "TIN"
                      }
                    }
                    debugger;
                    TINResponse = await ValidateTIN(TINRequest)
                    if(TINResponse)
                    {
                      TINFinalResponse = TINResponse.message;
                      TINFinalResponseCode = TINResponse.responseStatus;
                    }
                    
                    debugger;
                    
                  }

                  if(SupplierStreet)
                  {
                    AddressRequest = {
                      data: {
                      "Street" : SupplierStreet,
                      "City": SupplierCity,
                      "State" : SupplierState,
                      "zipCode" : SupplierPostalCode
                      }
                    }
                    AddressResponse = await doSupplierAddressCheck(AddressRequest);
                    // call USPS Address Validation Handler doSupplierAddressCheck()
                    let SplitAddressResponse = AddressResponse.split(':')
                    AddressResponseFinal = SplitAddressResponse[1];
                    AddressResponseFinalCode = SplitAddressResponse[0];

                  }
                  

                  if ( WorkspaceID )
                  {
                  
                  debugger;
                    
                  // Lets call Workspace Details API to get the details of the DocumentID. 

                  // Call Document Details to update the Validation Pagination Q&A

                  oRequestConfig.baseURL = 'https://openapi.ariba.com/api/sourcing-approval/v2/prod/Workspace/' + WorkspaceID;
                  oRequestConfig.method = "get";
                  
                  oRequestConfig.params = {
                                           realm:realm 
                                          };
                 
                  oRequestConfig.headers["Accept"]=oRequestConfig.headers["Content-Type"]="application/json";
                  oRequestConfig.headers["apikey"]=oDestination.originalProperties.destinationConfiguration.apikey;
    
                  console.log(`Request URL for Workspace ${oRequestConfig.baseURL}`);
                  console.log("Aribaeventhandler: Getting Workspace Details");
                  let workspaceresponse = await axios.request(oRequestConfig);
                  console.log(`Completed response to get task details ${workspaceresponse.data}`);
                  let foundDocumentRow = workspaceresponse.data.surveys.find(element => element.title == 'Supplier Control Tower - Review')   ;
                  
                  if (foundDocumentRow)
                  {
                    let DocumentID = foundDocumentRow.id;
                    // Now lets get teh Document Q&A

                    oRequestConfig.baseURL = 'https://openapi.ariba.com/api/sourcing-approval/v2/prod/Document/' + DocumentID;
                    oRequestConfig.method = "get";
                    
                    oRequestConfig.params = {
                                             realm:realm 
                                            };
                   
                    oRequestConfig.headers["Accept"]=oRequestConfig.headers["Content-Type"]="application/json";
                    oRequestConfig.headers["apikey"]=oDestination.originalProperties.destinationConfiguration.apikey;
      
                    console.log(`Request URL for Document ${oRequestConfig.baseURL}`);
                    console.log("Aribaeventhandler: Getting Document Details");
                    let documentresponse = await axios.request(oRequestConfig);
                    console.log(`Completed response to get Document details ${documentresponse.data}`);
                    let SMID = documentresponse.data.supplier.smVendorId;
                    console.log(`SM Vendor is ${SMID}`);
                    // Call Pagination API to update the Document with SMID 

                    const date = new Date();
                    const day = String(date.getDate()).padStart(2,'0');
                    const month = String(date.getMonth() + 1).padStart(2,'0');
                    const year = date.getFullYear();
                    const currentdate = `${month}/${day}/${year}`;

                    const item = JSON.parse(JSON.stringify(PUBLISHQA_TEMPLATE));

                    item.answers[0].answer = "True"; // Start Validation Process
                    item.answers[1].answer = currentdate; //Last Validation DAte
                    item.answers[2].answer = TINFinalResponse; // TIN Response
                    item.answers[3].answer = "OFAC Not Validated"; //OFACe
                    item.answers[4].answer = AddressResponseFinal; //Address Validation
                    item.answers[5].answer = "Docusign NDA Complete"; //DocuSign
                    let paginationpayload = JSON.stringify(item);
                    let approvalcomment = item.answers[2].answer + item.answers[4].answer;
                    let updaterespone = await UpdateExternalValidationinAriba(SMID,DocumentID,paginationpayload);

                    if (AddressResponseFinalCode == 'E' || TINFinalResponseCode > 1 )
                    {
                      // Send Error Message for Approval with Resubmit
                      ApprovalPost = {
                        "actionableType": "Task",
                        "uniqueName": `${TaskID}`,
                        "actionName": "DenyWithResubmit",
                        "options": {
                            "comment": `${approvalcomment}`
                        }
                      }

                    }
  
                    if (AddressResponseFinalCode == 'S' && TINFinalResponseCode == 0 ) 
                    {
                      //Send Success Message for Approval

                        ApprovalPost = {
                          "actionableType": "Task",
                          "uniqueName": `${TaskID}`,
                          "actionName": "Approve",
                          "options": {
                              "comment": `Validation Successfully Completed and Approved`
                          }
                        }
                                            
                    }

                    oRequestConfig.data = JSON.stringify(ApprovalPost);

                    oRequestConfig.baseURL = 'https://openapi.ariba.com/api/sourcing-approval/v2/prod/action'
                    oRequestConfig.method = "POST";
                    
                    oRequestConfig.params = {
                                             realm:realm,
                                             user:'gramachandran',
                                             passwordAdapter:'PasswordAdapter1'
                                            };

                    oRequestConfig.headers["Accept"]=oRequestConfig.headers["Content-Type"]="application/json";
                    oRequestConfig.headers["apikey"]=oDestination.originalProperties.destinationConfiguration.apikey;
      
                    console.log(`Request URL for Document ${oRequestConfig.baseURL}`);
                    console.log("Aribaeventhandler: Started: Approve or Rejct Pending Documents");
                    let approvalresponse = await axios.request(oRequestConfig);
                    console.log("Aribaeventhandler: Completed:Approve or Rejct Pending Documents");
                    debugger;

                  }

                 

                  } // Valid Workspae ID

                  
 
               

              }
              else
              {
                console.log("")
              }

         // Temporary Break with first line
         break;

             } // loop through all the records.
           
           
             debugger;
             return JSON.stringify(response.data);
         }
         catch(error){
      
             console.log(`Error while processing API call Pending Documents: ${error} `);
             return `Error`
         }

}


module.exports = {
  CreateSupplierInAriba,
  CreateSupplierUserInAriba,
  doSupplierNameCheckAriba,
  ProcessPendingValidations
};
