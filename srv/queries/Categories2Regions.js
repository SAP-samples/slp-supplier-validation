const getCategoryIDbyRegionID = (RegionID) => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.Categories2Regions")
    .columns("Categories_CategoryID")
    .where({
      Regions_RegionID: RegionID,
    });
};

module.exports = {
  getCategoryIDbyRegionID,
};
