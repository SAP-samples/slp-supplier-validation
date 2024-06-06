const getAddressByPlantID = (PlantID) => {
  return SELECT.one
    .from("com.sap.pgp.dev.SupplierControlApp.Plant2ShipToAddress")
    .where({ PlantID });
};

module.exports = {
  getAddressByPlantID,
};
