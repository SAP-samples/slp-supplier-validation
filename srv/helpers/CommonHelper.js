const { getCategoryIDbyRegionID } = require("../queries/Categories2Regions");
const { getRegionIDsByCountryID } = require("../queries/Country2Region");
const { createErrorLogs } = require("../queries/EventLogs");
const { getAddressByPlantID } = require("../queries/Plant2ShipToAddress");
const { getPRByPRID } = require("../queries/PurchaseRequisition");
const { getAllRegions } = require("../queries/Regions");

const getParentRegions = async (regionIDs) => {
  var regions = await getAllRegions();
  const result = {};

  regionIDs.forEach((regionID) => {
    let currentRegionID = regionID;
    let parentRegion = null;

    while (parentRegion !== "All") {
      const foundRegion = regions.find(
        (region) => region.RegionID === currentRegionID
      );
      if (foundRegion) {
        parentRegion = foundRegion.ParentRegion;
        result[currentRegionID] = parentRegion;
        currentRegionID = parentRegion;
      } else {
        break;
      }
    }
  });

  const uniqueRegions = [
    ...new Set([...regionIDs, ...Object.keys(result), "All"]),
  ];
  return uniqueRegions;
};

const getRecursiveRegionsOfPR = async (PRID) => {
  const PRequisition = await getPRByPRID(PRID); // just pick any one line and get the Plant ID
  const plantcode = PRequisition[0].PlantID;

  const address = await getAddressByPlantID(plantcode);
  if (Boolean(address) && Object.keys(address).length) {
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

      return { RegionIDs: uniqueRegionIDsWithParent, CategoryIDs };
    }
  } else {
    //Event logs should be added
    await createErrorLogs({
      Module: "RFQCreation",
      RequestOBJ: JSON.stringify({ PRID }),
      ResponseOBJ: "",
      EventName: "docreateEventfromPR",
      EventMessage: "Plant to ship address mapping not available!",
      Status: "FAIL",
    });
    return {};
  }
};

const getRegionOfPR = async (PRID) => {
  const PRequisition = await getPRByPRID(PRID); // just pick any one line and get the Plant ID
  const plantcode = PRequisition[0].PlantID;

  const Plant = await SELECT.from(
    "com.sap.pgp.dev.SupplierControlApp.Plant2ShipToAddress"
  ).where({ PlantID: `${plantcode}` });
  const Country = Plant[0].Country;

  const Region = await SELECT.one
    .from("com.sap.pgp.dev.SupplierControlApp.Country2Region")
    .where({ CountryID: `${Country}` });
  if (Region != null) {
    return Region.RegionID;
  } else {
    console.log("Error Region to Country Mapping not maintained");
    return "All";
  }
};

module.exports = {
  getParentRegions,
  getRegionOfPR,
  getRecursiveRegionsOfPR,
};
