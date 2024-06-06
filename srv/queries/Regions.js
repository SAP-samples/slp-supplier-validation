const getAllRegions = () => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.Regions");
};

module.exports = {
  getAllRegions,
};
