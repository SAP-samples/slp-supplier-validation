const doSaveSuppliersData = (entity) => {
  try {
    return UPSERT.into("com.sap.pgp.dev.SupplierControlApp.Suppliers").entries({
      SupplierID: `${entity.SupplierID || ""}`,
      SLPID: `${entity.SLPID || ""}`,
      ACMID: `${entity.ACMID}`,
      SupplierName: `${entity.SupplierName || ""}`,
      SupplierStreet: `${entity.SupplierStreet || ""}`,
      SupplierCity: `${entity.SupplierCity || ""}`,
      SupplierRegion: `${entity.SupplierRegion || ""}`,
      SupplierPostalCode: `${entity.SupplierRegion || ""}`,
      SupplierCountry: `${entity.SupplierCountry || ""}`,
      PrimaryContactFirstName: `${entity.PrimaryContactFirstName || ""}`,
      PrimaryContactLastName: `${entity.PrimaryContactLastName || ""}`,
      PrimaryContactEMail: `${entity.PrimaryContactEMail || ""}`,
      Active: `${entity.Active || ""}`,
    });
  } catch (err) {
    return false;
  }
};

const getSupplierDetailsByACMID = (ACMID) => {
  return SELECT.one.from("com.sap.pgp.dev.SupplierControlApp.Suppliers").where({
    ACMID,
  });
};

module.exports = {
  doSaveSuppliersData,
  getSupplierDetailsByACMID,
};
