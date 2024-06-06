const cds = require("@sap/cds");
const DatalakeHandler = require("./handlers/DatalakeHandler");
const UtilHandler = require("./util/AdminUtil");
const AdminHandler = require("./util/AdminHandler");
const ERPHandler = require("./util/ERPHandler");
const DocuSignHandler = require("./util/DocuSignHandler")
const AribaHandler = require("./util/AribaHandler")
const BPAHandler = require("./util/BPAHandler")
const SmartStreet = require("./util/SmartStreetHandler")
const TINHandler = require("./util/TinHandler")

module.exports = cds.service.impl((srv) => {
  srv.on("test", async (req) => {
    return "Hello word";
  });

  srv.on("doGetCategoriesData", DatalakeHandler.doGetCategoriesData);

  srv.on("doGetSupplierData", DatalakeHandler.doGetSupplierData);

  srv.on("doGetSupplierDetailData", DatalakeHandler.doGetSupplierDetailData);

  srv.on(
    "doGetSupplierDetailDataFromLocalDB",
    AdminHandler.doGetSupplierDetailDataFromLocalDB
  );

  srv.on("doGetUserInformation", UtilHandler.doGetUserInformation);
  srv.on("doGetSessionTime", UtilHandler.doGetSessionTime);
  srv.on("doSupplierNameCheck",ERPHandler.doSupplierNameCheck)
  srv.on("dogetAccessToken",DocuSignHandler.dogetAccessToken)
  srv.on("doGetEnvelopeStatuses",DocuSignHandler.doGetEnvelopeStatuses)
  srv.on("doCreateEnvelope",DocuSignHandler.doCreateEnvelope)
  srv.on("getNextNumber",AdminHandler.getNextNumber)
  srv.on("getSRInfo",AdminHandler.getSRInfo)
  srv.on("getSRStatus",AdminHandler.getSRStatus)
  srv.on("doUpdateStatus",AdminHandler.doUpdateStatus)
  srv.on("doSupplierNameCheckAriba",AribaHandler.doSupplierNameCheckAriba)
  srv.on("doTriggerAfterApproval",AdminHandler.doTriggerAfterApproval)
  srv.on("doInitiateWorkflow",BPAHandler.doInitiateWorkflow)
  srv.on("doReceiveWorkflowApprUpdate",BPAHandler.doReceiveWorkflowApprUpdate)
  srv.on("doReceiveWorkflowUpdate",BPAHandler.doReceiveWorkflowUpdate)
  srv.on("doReceiveWorkflowRejUpdate",BPAHandler.doReceiveWorkflowRejUpdate)
  srv.on("CreateSupplierInAriba",AribaHandler.CreateSupplierInAriba)
  srv.on("CreateSupplierUserInAriba",AribaHandler.CreateSupplierUserInAriba)
  srv.on("doSupplierAddressCheck",SmartStreet.doSupplierAddressCheck)
  srv.on("ValidateTIN",TINHandler.ValidateTIN)
  srv.on("ProcessPendingValidations",AribaHandler.ProcessPendingValidations)
});
