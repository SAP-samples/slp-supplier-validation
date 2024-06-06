const createErrorLogs = (entity) => {
  entity.TransactionDate = new Date();
  try {
    return INSERT.into("com.sap.pgp.dev.SupplierControlApp.EventLogs").entries(entity);
  } catch (err) {
    return false;
  }
};

module.exports = {
  createErrorLogs,
};
