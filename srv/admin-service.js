const cds = require("@sap/cds");

const AdminHandler = require("./util/AdminHandler");

module.exports = cds.service.impl((srv) => {

  srv.on("doCountrytoRegionMapping", AdminHandler.doCountrytoRegionMapping);

  srv.on("Org2UserMapping", AdminHandler.Org2UserMapping);

  srv.on("DoLoadCategories", AdminHandler.DoLoadCategories);

  srv.on("DoLoadSuppliers", AdminHandler.DoLoadSuppliers);

  srv.on("DoLoadRegions", AdminHandler.DoLoadRegions);

  srv.on("doDeleteCategories", AdminHandler.doDeleteCategories);

  srv.on("doDeleteSuppliers", AdminHandler.doDeleteSuppliers);

  srv.on("DoPullSuppliersFromAriba", AdminHandler.DoPullSuppliersFromAriba);

  srv.on("DoPullSupplierUserFromAriba", AdminHandler.DoPullSupplierUserFromAriba );
  
  srv.on("DownloadSampleCSVFile", AdminHandler.DownloadSampleCSVFile );

  
});
