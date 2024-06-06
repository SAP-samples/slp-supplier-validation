const getAllPurchaseRequisitions = () => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.PurchaseRequisition");
};

const getPurchaseRequisitionByStatus = (Status) => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.PurchaseRequisition").where({
    Status,
    PackageNo: 0, //need to remove that condition after making services PR working for RFQ
  });
};

const getPRByPRIDandPRITEM = (PRID, PRITEM) => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.PurchaseRequisition").where({
    PRID,
    PRITEM,
  });
};

const getPRByPRID = (PRID) => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.PurchaseRequisition").where({
    PRID,
  });
};

const updatePRActionStatus = (PRID, PRITEM) => {
  return UPDATE.entity("com.sap.pgp.dev.SupplierControlApp.PurchaseRequisition")
    .set({
      ActionStatus: true,
    })
    .where({ PRID, PRITEM });
};

module.exports = {
  getAllPurchaseRequisitions,
  getPurchaseRequisitionByStatus,
  getPRByPRIDandPRITEM,
  getPRByPRID,
  updatePRActionStatus,
};
