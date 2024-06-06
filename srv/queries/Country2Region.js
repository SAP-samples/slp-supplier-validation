const getRegionIDsByCountryID = (CountryID) => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.Country2Region")
    .columns("RegionID")
    .where({ CountryID });
};

module.exports = {
  getRegionIDsByCountryID,
};
