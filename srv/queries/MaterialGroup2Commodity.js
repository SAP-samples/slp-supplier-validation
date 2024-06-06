const getCommodityIDbyMaterialGroupID = (MaterialGroupID) => {
  return SELECT.one
    .from("com.sap.pgp.dev.SupplierControlApp.MaterialGroup2Commodity")
    .where({ MaterialGroupID });
};

module.exports = {
  getCommodityIDbyMaterialGroupID,
};
