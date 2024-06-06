"use strict";

//libraries
const cds = require("@sap/cds");
const cloudSDK = require("@sap-cloud-sdk/core");
const { default: axios } = require("axios");
const { MaterialGroup2Commodity, SupplierOrganization2User } = cds.entities(
  "com.sap.pgp.dev.SupplierControlApp"
);
const { v4: uuidv4 } = require("uuid");
const FormData = require("form-data");
const moment = require("moment");
const {
  CreateSupplierUserInAriba,
  CreateSupplierInAriba,
} = require("./AribaHandler");
const { generateUniqueRandomNumber, zeroPad } = require("../helpers/XML2JSON");
const {
  doSaveSuppliersData,
  getSupplierDetailsByACMID,
} = require("../queries/Suppliers");
var fs = require("fs");
const { Readable } = require("stream");
const JSZip = require("jszip");
const {
  doSaveSupplierUsersData,
} = require("../queries/SupplierOrganization2Users");
const { exit } = require("process");
const { createErrorLogs } = require("../queries/EventLogs");
const { getAddressByPlantID } = require("../queries/Plant2ShipToAddress");
const { getRegionIDsByCountryID } = require("../queries/Country2Region");
const { getAllRegions } = require("../queries/Regions");
const logger = require("../util/logger");
const { getParentRegions } = require("../helpers/CommonHelper");
const { getCategoryIDbyRegionID } = require("../queries/Categories2Regions");

async function getNextNumber(req) {
  debugger;

  try
  {
  let SRType = req.data.requesttype;
 
  let current = await SELECT.one
  .from("com.sap.pgp.dev.SupplierControlApp.NumberRange")
  .where({ Type: SRType });

  const nextNumber = current.CurrentNumber + 1;
  await UPDATE("com.sap.pgp.dev.SupplierControlApp.NumberRange", {
    Type: SRType
  }).set({ CurrentNumber: nextNumber });

  return nextNumber;
}
catch (error) {
  console.log("Error getting number");
 
}

}

async function doTriggerAfterApproval(req)
{
  return "Success";
}
async function getSRInfo(req) {
  debugger;
  let StatusArrs = [];
  try
  {
  let SRType = req.data.requesttype;
  let SRNumber, SupplierName, Stage1 , Stage2 , Stage3, Stage4 , Stage5 , SRN , SRN1 , ApprState;

  let current = await SELECT.from("com.sap.pgp.dev.SupplierControlApp.SupplierRequest")
  .orderBy({SuppRequestID: 'desc'}).limit(3);

  for (let i =0;i<current.length;i++)
  {
      SRN = current[i].SuppRequestID;
      SRN1 = Number(SRN.replace('SR',''));
      SRNumber = SRN1.toString();
      SupplierName = "Supplier Name : " + current[i].SupplierName;

      let SRStat = await SELECT.one.from("com.sap.pgp.dev.SupplierControlApp.SRStatus").where({Type:SRType,SuppRequestID:SRNumber});

      if ( SRStat.Status == 'SR Created')
      {
        Stage1 = "Success";
        Stage2 = "Warning";
        Stage3 = "Warning";
        Stage4 = "Warning";
        Stage5 = "Warning";
      }

      if ( SRStat.Status == 'Signature Completed')
      {
        Stage1 = "Success";
        Stage2 = "Success";
        Stage3 = "Warning";
        Stage4 = "Warning";
        Stage5 = "Warning";
      }
      
      if ( SRStat.Status == 'SR Approval Complete')
      {
        Stage1 = "Success";
        Stage2 = "Success";
        Stage3 = "Success";
        Stage4 = "Warning";
        Stage5 = "Warning";
      }
      
      if ( SRStat.Status == 'Ariba Supplier Created')
      {
        Stage1 = "Success";
        Stage2 = "Success";
        Stage3 = "Success";
        Stage4 = "Success";
        Stage5 = "Warning";
      }

      if ( SRStat.Status == 'Supplier Request Rejected')
      {
        Stage1 = "Success";
        Stage2 = "Success";
        Stage3 = "Error";
        Stage4 = "Error";
        Stage5 = "Error";
      }
      
      if ( SRStat.Status == 'Supplier Registration Started')
      {
        Stage1 = "Success";
        Stage2 = "Success";
        Stage3 = "Success";
        Stage4 = "Success";
        Stage5 = "Success";
      }
      ApprState = "Approval State:" + SRStat.Status;
      let SRNum = "Supplier Request:" + SRN;

      let StatusArr = {
        SRNumber: SRNum,
        SupplierName: SupplierName,
        ApprovalState: ApprState,
        Stage1 : Stage1,
        Stage2 : Stage2,
        Stage3 : Stage3,
        Stage4 : Stage4,
        Stage5 : Stage5 
      };
      StatusArrs.push(StatusArr)

      Stage1 = "";Stage2="";Stage3="";Stage4="";Stage5="";ApprState="";
  }

  return JSON.stringify(StatusArrs);

}
catch (error) {
  console.log("Error getting number");
 
}

}


async function getSRStatus(req) {
  debugger;

  try
  {
  let SRType = req.data.requesttype;
  let SRNumber = req.data.SRID;

  let SRN1 = Number(SRNumber.replace('SR',''));
  let SRNumberStr = SRN1.toString();


  let SRStat = await SELECT.one.from("com.sap.pgp.dev.SupplierControlApp.SRStatus").where({Type:SRType,SuppRequestID:SRNumberStr});

  return JSON.stringify(SRStat.Status);
      
  }

catch (error) {
  console.log("Error getting Status");
 
}

}

async function doUpdateStatus(req) {

  try {

  debugger;

  let SRType = req.data.requesttype;
  let SRID = req.data.SRID;
  let Status = req.data.Status;
 
  await UPSERT.into(
    "com.sap.pgp.dev.SupplierControlApp.SRStatus"
  ).entries({
    Type: `${SRType}` ,
    SuppRequestID: `${SRID}`,
    Status : `${Status}`
  });
 
} catch (error) {
  console.log("Error updating status");
 
}

   return "Success";
}


async function DoLoadTailSpendSupplier(req) {
  try {
    debugger;
    const entities = req.data.entities;
    const srv = cds.transaction(req);

    const results = await Promise.all(
      entities.map(async (entity) => {
        return await UPSERT.into(
          "com.sap.pgp.dev.SupplierControlApp.TailSpendSuppliers"
        ).entries({
          ACMID: `${entity.ACMID}`,
          SupplierID: `${entity.SupplierID}`,
          CategoryID: `${entity.CategoryID}`,
          RegionID: `${entity.RegionID}`,
          SLPID: `${entity.SLPID}`,
          SupplierName: `${entity.SupplierName}`,
          contactfn: `${entity.contactfn}`,
          contactln: `${entity.contactln}`,
          contactemail: `${entity.contactemail}`,
          City: `${entity.City}`,
          Country: `${entity.Country}`,
          AutoRFQEligble: `${entity.AutoRFQEligble}`,
        });
      })
    );

    return "Successfully updated Tail Spend Suppliers Data";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function ACM2ERPMapping(req) {
  try {
    debugger;
    const entities = req.data.entities;
    const srv = cds.transaction(req);

    const results = await Promise.all(
      entities.map(async (entity) => {
        return await UPSERT.into(
          "com.sap.pgp.dev.SupplierControlApp.ACM2ERPMapping"
        ).entries({
          ACMID: `${entity.ACMID}`,
          ERPID: `${entity.ERPID}`,
        });
      })
    );

    return "Successfully updated ACM2ERP Mapping";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function doPlantAddressMapping(req) {
  try {
    debugger;
    const entities = req.data.entities;
    const srv = cds.transaction(req);

    const results = await Promise.all(
      entities.map(async (entity) => {
        return await UPSERT.into(
          "com.sap.pgp.dev.SupplierControlApp.Plant2ShipToAddress"
        ).entries({
          PlantID: `${entity.PlantID}`,
          Street: `${entity.Street}`,
          City: `${entity.City}`,
          State: `${entity.State}`,
          PostalCode: `${entity.PostalCode}`,
          Country: `${entity.Country}`,
        });
      })
    );

    // const results = await Promise.all(entities.map(async (entity) => {
    //  return await srv.create('com.sap.pgp.dev.SupplierControlApp.Plant2ShipToAddress',entity)
    // }));

    return "Successfully updated Plant Address Mapping";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function doCountrytoRegionMapping(req) {
  try {
    debugger;
    const entities = req.data.entities;
    const srv = cds.transaction(req);

    const results = await Promise.all(
      entities.map(async (entity) => {
        return await UPSERT.into(
          "com.sap.pgp.dev.SupplierControlApp.Country2Region"
        ).entries({
          CountryID: `${entity.CountryID}`,
          RegionID: `${entity.RegionID}`,
        });
      })
    );

    // const results = await Promise.all(entities.map(async (entity) => {
    //  return await srv.create('com.sap.pgp.dev.SupplierControlApp.Country2Region',entity)
    // }));

    return "Successfully updated Country to Region Mapping";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function Org2UserMapping(req) {
  try {
    debugger;
    const entities = req.data.entities;
    const srv = cds.transaction(req);

    const results = await Promise.all(
      entities.map(async (entity) => {
        return await UPSERT.into(
          "com.sap.pgp.dev.SupplierControlApp.SupplierOrganization2Users"
        ).entries({
          ExternalOrganizationID: `${entity.ExternalOrganizationID}`,
          OrganizationName: `${entity.OrganizationName}`,
          IsManaged: `${entity.IsManaged}`,
          IsSupplier: `${entity.IsSupplier}`,
          OrganizationTaxID: `${entity.OrganizationTaxID}`,
          OrganizationStateTIN: `${entity.OrganizationStateTIN}`,
          OrganizationRegionalTIN: `${entity.OrganizationRegionalTIN}`,
          IsCustomer: `${entity.IsCustomer}`,
          OrganizationVatID: `${entity.OrganizationVatID}`,
          ExternalParentOrganizationID: `${entity.ExternalParentOrganizationID}`,
          IsOrgApproved: `${entity.IsOrgApproved}`,
          CorporatePhone: `${entity.CorporatePhone}`,
          CorporateFax: `${entity.CorporateFax}`,
          CorporateEmailAddress: `${entity.CorporateEmailAddress}`,
          CompanyURL: `${entity.CompanyURL}`,
          Address: `${entity.Address}`,
          City: `${entity.City}`,
          State: `${entity.State}`,
          ZipCode: `${entity.ZipCode}`,
          Country: `${entity.Country}`,
          OrganizationType: `${entity.OrganizationType}`,
          AddressName: `${entity.AddressName}`,
          LoginID: `${entity.LoginID}`,
          FullName: `${entity.FullName}`,
          EmailAddress: `${entity.EmailAddress}`,
          Phone: `${entity.Phone}`,
          IsUserApproved: `${entity.IsUserApproved}`,
          DefaultCurrency: `${entity.DefaultCurrency}`,
          TimeZoneID: `${entity.TimeZoneID}`,
          PreferredLocale: `${entity.PreferredLocale}`,
        });
      })
    );

    // const results = await Promise.all(entities.map(async (entity) => {
    //  return await srv.create('com.sap.pgp.dev.SupplierControlApp.SupplierOrganization2Users',entity)
    // }));

    return "Successfully updated Supplier to User Org. Mapping";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function DoLoadCategories(req) {
  try {
    debugger;
    const entities = req.data.entities;
    const srv = cds.transaction(req);

    const results = await Promise.all(
      entities.map(async (entity) => {
        return await UPSERT.into(
          "com.sap.pgp.dev.SupplierControlApp.Categories"
        ).entries({
          CategoryID: `${entity.CategoryID}`,
          CategoryDesc: `${entity.CategoryDesc}`,
        });
      })
    );

    // const results = await Promise.all(entities.map(async (entity) => {
    //  return await srv.create('com.sap.pgp.dev.SupplierControlApp.Categories',entity)
    // }));

    return "Successfully updated Categories Data";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}


async function DoLoadSuppliers(req) {
  try {
    const entities = req.data.entities;

    entities.map(async (item) => {
      //if ACM ID is provided & SupplierID is not provided then save the ACM ID as well in SupplierID column.
      if (!Boolean(item.SupplierID) && Boolean(item.ACMID)) {
        item.SupplierID = zeroPad(item.ACMID, 10);
        item.ACMID = zeroPad(item.ACMID, 10);
      }

      //if ACM ID, SupplierID both are not provided generate a random string for 10 digit & save it as a Supplier ID
      if (!Boolean(item.SupplierID) && !Boolean(item.ACMID)) {
        //generate a random SupplierID here
        const generatedSupplierID = generateUniqueRandomNumber(9);
        item.ACMID = zeroPad(generatedSupplierID, 10);
      }

      const apiResponse = await CreateSupplierInAriba(item);
      return apiResponse;
    });

    return "Update/Insert task is running in background, In some cases it may take some time to reflect in our Database.";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function DoLoadRegions(req) {
  try {
    debugger;
    const entities = req.data.entities;
    const srv = cds.transaction(req);

    const results = await Promise.all(
      entities.map(async (entity) => {
        return await UPSERT.into("com.sap.pgp.dev.SupplierControlApp.Regions").entries({
          RegionID: `${entity.RegionID}`,
          RegionName: `${entity.RegionName}`,
          ParentRegion: `${entity.ParentRegion}`,
        });
      })
    );

    return "Successfully updated Regions Data";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function DoLoadMaterialGroup2Commodity(req) {
  try {
    debugger;
    const entities = req.data.entities;
    const srv = cds.transaction(req);

    const results = await Promise.all(
      entities.map(async (entity) => {
        return await UPSERT.into(
          "com.sap.pgp.dev.SupplierControlApp.MaterialGroup2Commodity"
        ).entries({
          MaterialGroupID: `${entity.MaterialGroupID}`,
          MaterialGroupDesc: `${entity.MaterialGroupDesc}`,
          CommodityID: `${entity.CommodityID}`,
          CommodityDesc: `${entity.CommodityDesc}`,
        });
      })
    );

    return "Successfully updated MaterialGroup2Commodity Data";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function DoLoadCategories2Suppliers(req) {
  try {
    debugger;
    const entities = req.data.entities;
    const srv = cds.transaction(req);

    const results = await Promise.all(
      entities.map(async (entity) => {
        let existingRecord = await SELECT.one
          .from("com.sap.pgp.dev.SupplierControlApp.Categories2Suppliers")
          .where({
            Categories_CategoryID: `${entity.Categories_CategoryID}`,
            Suppliers_ACMID: `${entity.Suppliers_ACMID}`,
          });
        if (existingRecord) {
          return await UPSERT.into(
            "com.sap.pgp.dev.SupplierControlApp.Categories2Suppliers"
          ).entries({
            ID: `${existingRecord.ID}`,
            Categories_CategoryID: `${entity.Categories_CategoryID}`,
            Suppliers_ACMID: `${entity.Suppliers_ACMID}`,
          });
        } else {
          const id = uuidv4();
          return await UPSERT.into(
            "com.sap.pgp.dev.SupplierControlApp.Categories2Suppliers"
          ).entries({
            ID: `${id}`,
            Categories_CategoryID: `${entity.Categories_CategoryID}`,
            Suppliers_ACMID: `${entity.Suppliers_ACMID}`,
          });
        }
      })
    );

    return "Successfully updated DoLoadCategories2Suppliers Data";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function DoLoadCategories2Regions(req) {
  try {
    debugger;
    const entities = req.data.entities;

    await Promise.all(
      entities.map(async (entity) => {
        let existingRecord = await SELECT.one
          .from("com.sap.pgp.dev.SupplierControlApp.Categories2Regions")
          .where({
            Categories_CategoryID: `${entity.Categories_CategoryID}`,
            Regions_RegionID: `${entity.Regions_RegionID}`,
          });
        if (existingRecord) {
          return await UPSERT.into(
            "com.sap.pgp.dev.SupplierControlApp.Categories2Regions"
          ).entries({
            ID: `${existingRecord.ID}`,
            Categories_CategoryID: `${entity.Categories_CategoryID}`,
            Regions_RegionID: `${entity.Regions_RegionID}`,
          });
        } else {
          const id = uuidv4();
          return await UPSERT.into(
            "com.sap.pgp.dev.SupplierControlApp.Categories2Regions"
          ).entries({
            ID: `${id}`,
            Categories_CategoryID: `${entity.Categories_CategoryID}`,
            Regions_RegionID: `${entity.Regions_RegionID}`,
          });
        }
      })
    );


    return "Successfully updated Categories2Regions Data";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}
//Make the Suppliers Inactive.. Dont Delete
async function doDeleteSuppliers(req) {
  try {
    debugger;
    const entities = req.data.entities;
    const srv = cds.transaction(req);

    await Promise.all(
      entities.map(async (entity) => {
        return await UPDATE("com.sap.pgp.dev.SupplierControlApp.Suppliers", {
          SupplierID: `${entity.SupplierID}`,
        }).set({ Active: "" });
      })
    );

    return "Successfully Inactivated Suppliers Data";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function doDeleteCategories(req) {
  try {
    debugger;
    const entities = req.data.entities;
    const srv = cds.transaction(req);

    await Promise.all(
      entities.map(async (entity) => {
        return await srv.delete(
          "com.sap.pgp.dev.SupplierControlApp.Categories",
          entity
        );
      })
    );

    return "Successfully Deleted Category";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function DoPullSuppliersFromAriba(req) {
  debugger;
  const oData = req.data;
  const { realm } = oData;
  const CurrentLoadDate = Date.now();
  const RealmURL = "https://s1-integration.ariba.com/";
  const Eventname = "Export Supplier Organizations (CSV)";
  const Process = "Sourcing";
  const InitialLoadDate = moment().startOf("2000");
  const LastLoadDate = await SELECT.one.from(
    "com.sap.pgp.dev.SupplierControlApp.SiteControlParams"
  );

  let FromDate;

  const EventExportURL = `${RealmURL}${Process}/filedownload?realm=${realm}`;

  if (!Boolean(LastLoadDate?.SupplierSyncedAt)) {
    FromDate = moment(InitialLoadDate, "YYYY-DD-MM HH:mm:ss").unix();
    // FromDate = `1546358012000`;
  } else {
    FromDate = LastLoadDate?.SupplierSyncedAt;
  }

  const formData = new FormData();
  formData.append("event", Eventname);
  formData.append("sharedSecret", "ARIBA123");
  formData.append("from", FromDate);
  formData.append("to", CurrentLoadDate);

  try {
    const response = await axios({
      method: "post",
      url: EventExportURL,
      data: formData,
      responseType: "arraybuffer",
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.headers["content-type"] === "application/zip") {
      const zipData = response.data;

      // Process the ZIP file
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(zipData);

      if (
        zipContents.files["SupplierOrganization_Export.csv"] &&
        zipContents.files["SupplierOrganizationOrganizationIDPart_Export.csv"]
      ) {
        const supplierOrgCSVFile =
          zipContents.files["SupplierOrganization_Export.csv"];
        const supplierOrgCSVContent = await supplierOrgCSVFile.async("text");

        const supplierOrgIDpartCSVFile =
          zipContents.files[
            "SupplierOrganizationOrganizationIDPart_Export.csv"
          ];
        const supplierOrgIDpartCSVContent =
          await supplierOrgIDpartCSVFile.async("text");

        const supplierOrgRows = supplierOrgCSVContent.trim().split("\n");

        supplierOrgRows.shift(); // it will shift first row "UTF-8"
        supplierOrgRows.shift(); // it will shift csv headers row

        const suppliersOrgIDpartRows = supplierOrgIDpartCSVContent
          .trim()
          .split("\n");

        suppliersOrgIDpartRows.shift(); // it will shift first row "UTF-8"
        suppliersOrgIDpartRows.shift(); // it will shift csv headers row

        const entities = [];

        supplierOrgRows.forEach((row) => {
          const values = row.split(",");
          const ACMID = values[4].trim().replace(/['"]+/g, "");

          //START:: finding ERPID for respective ACMID
          let SupplierID;
          suppliersOrgIDpartRows.map((item) => {
            const IDPartData = item.split(",");
            const Domain = IDPartData[0].trim().replace(/['"]+/g, "");
            const ParentSupplierID = IDPartData[2].trim().replace(/['"]+/g, "");
            if (Domain == "sap" && ParentSupplierID == ACMID) {
              SupplierID = IDPartData[1].trim().replace(/['"]+/g, "");
            }
          });
          //END:: finding ERPID for respective ACMID

          const entity = {
            ACMID,
            SupplierID,
            SupplierName: values[26].trim().replace(/['"]+/g, ""),
            SupplierCity: values[10].trim().replace(/['"]+/g, ""),
            SupplierCountry: values[11].trim().replace(/['"]+/g, ""),
            SupplierStreet: values[12]
              .trim()
              .replace(/['"]+/g, "")
              .replace(/,/g, " "),
            SupplierPostalCode: values[13].trim().replace(/['"]+/g, ""),
            SupplierRegion: values[14].trim().replace(/['"]+/g, ""),
            PrimaryContactFirstName: "",
            PrimaryContactLastName: "",
            PrimaryContactEMail: values[1].trim().replace(/['"]+/g, ""),
            Active: values[25].trim().replace(/['"]+/g, ""),
          };
          entities.push(entity);
        });

        entities.map(async (entity) => {
          await doSaveSuppliersData(entity);
        });

        UPDATE.entity("com.sap.pgp.dev.SupplierControlApp.SiteControlParams").set({
          SupplierSyncedAt: CurrentLoadDate,
        });
        return JSON.stringify(
          "Supplier syncing is running in background, please verify the synced updates in sometime."
        );
      } else {
        
        console.error("CSV file not found in the ZIP archive.");
       
      }
    } else {
      debugger;
      console.log("The response does not appear to be a ZIP file.");
    
    }

    return true;
  } catch (error) {
    debugger;
    console.log("Error:", error.message);
   

    return false;
  }
}

async function DoPullSupplierUserFromAriba(req) {
  debugger;
  const oData = req.data;
  const { realm } = oData;
  const CurrentLoadDate = Date.now();
  const RealmURL = "https://s1-integration.ariba.com/";
  const Eventname = "Export Supplier Users and Organizations (CSV)";
  const Process = "Sourcing";
  const InitialLoadDate = moment().startOf("2000");
  const LastLoadDate = await SELECT.one.from(
    "com.sap.pgp.dev.SupplierControlApp.SiteControlParams"
  );
  let FromDate;

  const EventExportURL = `${RealmURL}${Process}/filedownload?realm=${realm}`;

  if (!Boolean(LastLoadDate?.SupplierUserSyncedAt)) {
    FromDate = moment(InitialLoadDate, "YYYY-DD-MM HH:mm:ss").unix();
  } else {
    FromDate = LastLoadDate?.SupplierUserSyncedAt;
  }

  const formData = new FormData();
  formData.append("event", Eventname);
  formData.append("sharedSecret", "ARIBA123");
  formData.append("from", FromDate);
  formData.append("to", CurrentLoadDate);

  try {
    const response = await axios({
      method: "post",
      url: EventExportURL,
      data: formData,
      responseType: "arraybuffer",
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.headers["content-type"] === "application/zip") {
      const zipData = response.data;

      // Process the ZIP file
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(zipData);

      if (zipContents.files["NewSupplierExportCSV.csv"]) {
        const csvFile = zipContents.files["NewSupplierExportCSV.csv"];
        const csvContent = await csvFile.async("text");
        console.log("Before Trim of CSV Content");
        const rows = csvContent.trim().split("\n");
        console.log("After Trim of CSV Content");
        rows.shift(); // it will shift first row "UTF-8"
        rows.shift(); // it will shift column headers

        const entities = [];
        debugger;
        rows.forEach((row) => {
          debugger;
          let ExternalOrganizationID = "";
          let OrganizationName = "";
          let Address = "";
          let CorporateEmailAddress = "";
          let Country = "";
          let FullName = "";
          let EmailAddress = "";
          let IsUserApproved = "";
          let DefaultCurrency = "";
          let LoginID = "";

          console.log("Inside Rows for Each");
          const values = row.split(",");
          // console.log("Entity Data Start collecting the users data");
          // console.log(`Value of ExternalOrganizationID is ${values[20]}`);
          // console.log(`Value of Login ID is ${values[1]}`);
          // console.log(`Value of Address is ${values[15]}`);
          // console.log(`Value of CorporateEmailAddress is ${values[13]}`);
          // console.log(`Value of Country is ${values[19]}`);
          // console.log(`Value of FullName is ${values[23]}`);
          // console.log(`Value of EmailAddress is ${values[10]}`);
          // console.log(`Value of IsUserApproved is ${values[26]}`);
          // console.log(`Value of DefaultCurrency is ${values[28]}`);
        if (values[0] !== undefined && values[0] !== null )
        {
           ExternalOrganizationID = values[0].trim().replace(/['"]+/g, "");
        }
        // if (values[1] !== undefined && values[1] !== null )
        // {
        //    LoginID = values[1].trim().replace(/['"]+/g, "");
        // }
        if (values[24] !== undefined && values[24] !== null )
        {
           CorporateEmailAddress = values[24].trim().replace(/['"]+/g, "");
        }
        if (values[16] !== undefined && values[16] !== null )
        {
          Country = values[16].trim().replace(/['"]+/g, "");
        }
        if (values[22] !== undefined && values[22] !== null )
        {
           LoginID = values[22].trim().replace(/['"]+/g, "");
        }
        if (values[23] !== undefined && values[23] !== null )
        {
           FullName = values[23].trim().replace(/['"]+/g, "");
        }
        if (values[24] !== undefined && values[24] !== null )
        {
          EmailAddress = values[24].trim().replace(/['"]+/g, "");
        }
        if (values[27] !== undefined && values[27] !== null )
        {
           DefaultCurrency = values[27].trim().replace(/['"]+/g, "");
        }

         if (ExternalOrganizationID != "" || LoginID != "" )
         {
          const entity = {
            ExternalOrganizationID: ExternalOrganizationID,
            OrganizationName:OrganizationName ,
            IsManaged:"",
            IsSupplier: "Yes",
            OrganizationTaxID: "",
            OrganizationStateTIN: "",
            OrganizationRegionalTIN: "",
            IsCustomer: "No",
            OrganizationVatID: "",
            ExternalParentOrganizationID: "",
            IsOrgApproved:"",
            CorporatePhone: "",
            CorporateFax: "",
            CorporateEmailAddress: CorporateEmailAddress,
            CompanyURL: "",
            Address: "",
            City: "",
            State: "",
            ZipCode: "",
            Country: Country,
            OrganizationType: "",
            AddressName: "",
            LoginID: LoginID,
            FullName: FullName,
            EmailAddress: EmailAddress,
            Phone: "",
            IsUserApproved: "Yes",
            DefaultCurrency: DefaultCurrency,
            TimeZoneID: "",
            PreferredLocale: "",
          };
         
          
         entities.push(entity);

         }

        });

        
        console.log("Finsihed collecting the users data");
        debugger;
        for ( let i = 0; i< entities.length;i++)
        {
        await wait(2000);
        await UPSERT.into(
          "com.sap.pgp.dev.SupplierControlApp.SupplierOrganization2Users"
        ).entries({
          ExternalOrganizationID: `${entities[i].ExternalOrganizationID}`,
          OrganizationName: `${entities[i].OrganizationName || ""}`,
          IsManaged: `${entities[i].IsManaged || ""}`,
          IsSupplier: `${entities[i].IsSupplier || ""}`,
          OrganizationTaxID: `${entities[i].OrganizationTaxID || ""}`,
          OrganizationStateTIN: `${entities[i].OrganizationStateTIN || ""}`,
          OrganizationRegionalTIN: `${entities[i].OrganizationRegionalTIN || ""}`,
          IsCustomer: `${entities[i].IsCustomer || ""}`,
          OrganizationVatID: `${entities[i].OrganizationVatID || ""}`,
          ExternalParentOrganizationID: `${
            entities[i].ExternalParentOrganizationID || ""
          }`,
          IsOrgApproved: `${entities[i].IsOrgApproved || ""}`,
          CorporatePhone: `${entities[i].CorporatePhone || ""}`,
          CorporateFax: `${entities[i].CorporateFax || ""}`,
          CorporateEmailAddress: `${entities[i].CorporateEmailAddress || ""}`,
          CompanyURL: `${entities[i].CompanyURL || ""}`,
          Address: `${entities[i].Address || ""}`,
          City: `${entities[i].City || ""}`,
          State: `${entities[i].State || ""}`,
          ZipCode: `${entities[i].ZipCode || ""}`,
          Country: `${entities[i].Country || ""}`,
          OrganizationType: `${entities[i].OrganizationType || ""}`,
          AddressName: `${entities[i].AddressName || ""}`,
          LoginID: `${entities[i].LoginID}`,
          FullName: `${entities[i].FullName || ""}`,
          EmailAddress: `${entities[i].EmailAddress || ""}`,
          Phone: `${entities[i].Phone || ""}`,
          IsUserApproved: `${entities[i].IsUserApproved || ""}`,
          DefaultCurrency: `${entities[i].DefaultCurrency || ""}`,
          TimeZoneID: `${entities[i].TimeZoneID || ""}`,
          PreferredLocale: `${entities[i].PreferredLocale || ""}`,
          IsEmailInviteNeeded: `${entities[i].IsEmailInviteNeeded || ""}`,
        });

        }

        // entities.map(async (entity) => {
        //   await doSaveSupplierUsersData(entity);
        // });
        console.log("After doSaveSupplierUsersData");
        UPDATE.entity("com.sap.pgp.dev.SupplierControlApp.SiteControlParams").set({
          SupplierUserSyncedAt: CurrentLoadDate,
        });
        return JSON.stringify(
          "Supplier users syncing is running in background, please verify the synced updates in sometime."
        );
      } else {
        
        console.log("CSV file not found in the ZIP archive.");
      
      }
    } else {
      console.log("The response does not appear to be a ZIP file.");

    }

    return true;
  } catch (error) {

   
    console.log(`Error: ${error.message}`);
    return false;
  }
}

function wait(timeout)
{
  console.log("waiting for 2 seconds");
  return new Promise(resolve => {
    setTimeout(resolve,timeout);
  });
}

async function doLoadSupplierUsers(req) {
  try {
    const { entities } = req.data;

    for (let i = 0; i < entities.length; i++) {
      await CreateSupplierUserInAriba(entities[i]);
    }

    return "Update/Insert task is running in background, In some cases it may take some time to reflect in our Database.";
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function DownloadSampleCSVFile(req) {
  try {
    const { fileName } = req.data;
    const filePath = "./srv/interim/" + fileName;

    if (fs.existsSync(filePath)) {
      // Read the file and send it as a stream
      const fileStream = fs.createReadStream(filePath);
      const dataStream = new Readable().wrap(fileStream);

      return new Promise((resolve, reject) => {
        let data = "";
        dataStream.on("data", (chunk) => {
          data += chunk;
        });

        dataStream.on("end", () => {
          // Convert the data to a base64 string
          const base64String = Buffer.from(data).toString("base64");
          resolve(base64String);
        });

        dataStream.on("error", (error) => {
          reject(error);
        });
      });
    } else {
      return `File '${fileName}' not found.`;
    }
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function doGetSupplierDetailDataFromLocalDB(req) {
  try {
    let oData = req.data;
    var Activeflag = false;
    let { ACMID, Region, Category: CategoryID } = oData;

    const SupplierData = await getSupplierDetailsByACMID(ACMID);

    if (SupplierData) {
      const {
        Active,
        SupplierID,
        SupplierName,
        SLPID,
        ACMID,
        SupplierCity,
        SupplierCountry,
        PrimaryContactFirstName,
        PrimaryContactLastName,
        PrimaryContactEMail,
      } = SupplierData;

      SupplierData.QualificationStatus =
        Active === "2" ? "Qualified" : "Disqualified";
      SupplierData.Category = CategoryID;
      SupplierData.Region = Region;
      SupplierData.SLPSupplier_SMVendorId = SLPID;

      const SLPData = {};
      SLPData.ERPVendorId = SupplierID;
      SLPData.SupplierName = SupplierName;
      SLPData.ACMId = ACMID;
      SLPData.AddressCity = SupplierCity;
      SLPData.AddressCountryCode = SupplierCountry;
      SLPData.PrimaryContactFirstName = PrimaryContactFirstName;
      SLPData.PrimaryContactLastName = PrimaryContactLastName;
      SLPData.PrimaryContactEMail = PrimaryContactEMail;
      SupplierData.SLPSupplier = SLPData;
    }

    let PreferredSupplier = await SELECT.one
      .from("com.sap.pgp.dev.SupplierControlApp.TailSpendSuppliers")
      .where({ ACMID: ACMID, CategoryID: CategoryID, RegionID: Region });
    if (PreferredSupplier != null) {
      Activeflag = PreferredSupplier.AutoRFQEligble === "X" ? true : false;
    }

    await Promise.all([SupplierData, PreferredSupplier]);

    if (Object.keys(SupplierData).length) SupplierData.checked = Activeflag;
    return JSON.stringify(SupplierData);
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

async function DoGetPreferredSuppliersForPR(req) {
  try {
    let oData = req.data;
    let { PlantID } = oData;

    const address = await getAddressByPlantID(PlantID);
    const { State, Country } = address;

    if (Boolean(State) || Boolean(Country)) {
      const AddressArray = [];
      if (Boolean(State)) AddressArray.push(State);
      if (Boolean(Country)) AddressArray.push(Country);
      let RegionIDs = await getRegionIDsByCountryID({ IN: AddressArray });
      //create a regions array variable like ["region1", "region2"]
      RegionIDs = RegionIDs.map((item) => item.RegionID);
      //loop through avaibale regions & check for their parents in regions table until didn't get all & update the regions array.
      const uniqueRegionIDsWithParent = await getParentRegions(RegionIDs);

      //get CategoryID for each RegionID using CategoriestoRegion Mapping
      var CategoryIDs = await getCategoryIDbyRegionID({
        IN: uniqueRegionIDsWithParent,
      });
      CategoryIDs = CategoryIDs.map((item) => item.Categories_CategoryID);

      return JSON.stringify(CategoryIDs);
    } else {
      return JSON.stringify(
        "Preferred Suppliers is not found for selected Purchase Requisition."
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
    logger.error("Error:", error.message);
  }
}

module.exports = {
  getNextNumber,
  doUpdateStatus,
  doTriggerAfterApproval,
  getSRInfo,
  getSRStatus,
  doPlantAddressMapping,
  doCountrytoRegionMapping,
  ACM2ERPMapping,
  Org2UserMapping,
  DoLoadCategories,
  DoLoadSuppliers,
  DoLoadRegions,
  DoLoadMaterialGroup2Commodity,
  DoLoadTailSpendSupplier,
  DoLoadCategories2Suppliers,
  DoLoadCategories2Regions,
  doDeleteCategories,
  doDeleteSuppliers,
  DoPullSuppliersFromAriba,
  DoPullSupplierUserFromAriba,
  doLoadSupplierUsers,
  DownloadSampleCSVFile,
  doGetSupplierDetailDataFromLocalDB,
  DoGetPreferredSuppliersForPR,
};
