const getAllRFPHandle = () => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.RFPHandle");
};

const getRFPHandleByHandleID = (RFPHandleID) => {
  return SELECT.one
    .from("com.sap.pgp.dev.SupplierControlApp.RFPHandle")
    .where({ RFPHandleID });
};

const getRFPHandleByPRIDandPRITEM = (PRID, PRITEM) => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.RFPHandle").where({
    PRID,
    PRITEM,
  });
};

const getPendingRFPHandles = () => {
  return SELECT.from("com.sap.pgp.dev.SupplierControlApp.RFPHandle").where({
    Processed: null,
  });
};

module.exports = {
  getAllRFPHandle,
  getRFPHandleByHandleID,
  getRFPHandleByPRIDandPRITEM,
  getPendingRFPHandles,
};
