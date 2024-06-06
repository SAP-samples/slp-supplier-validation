const getAllTailSpendSuppliers = () => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.TailSpendSuppliers");
};

const getTailSpendSuppliersByCategoryID = (CategoryID) => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.TailSpendSuppliers").where({
    CategoryID,
  });
};

const getTailSpendSuppliersByCategoryIDRegionID = (CategoryID, RegionID) => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.TailSpendSuppliers").where({
    CategoryID,
    RegionID,
    AutoRFQEligble: "X",
  });
};

const getTailSpendSuppliersByRegionID = (RegionID) => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.TailSpendSuppliers").where({
    RegionID,
  });
};

module.exports = {
  getAllTailSpendSuppliers,
  getTailSpendSuppliersByCategoryID,
  getTailSpendSuppliersByRegionID,
  getTailSpendSuppliersByCategoryIDRegionID,
};
