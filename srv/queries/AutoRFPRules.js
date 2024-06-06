const getAllAutoRFPRules = () => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.AutoRFPRules");
};

const getAutoRFPRuleByRegion = (RegionID) => {
  return SELECT.one
    .from("com.sap.pgp.dev.SupplierControlApp.AutoRFPRules")
    .where({ RegionID });
};

module.exports = {
  getAllAutoRFPRules,
  getAutoRFPRuleByRegion,
};
