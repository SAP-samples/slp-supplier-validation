sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast"],
  function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.SiteControlParams",
      {
        onInit: function () {
          const SourcingApplication = [{ Name: "Ariba" }];
          this.setModel(
            new JSONModel({
              SourcingApplication,
            }),
            "SCPViews"
          );
        },

        OnPressSave: function (oEvent) {
          var DataLakeEnabled = this.getView()
            .byId("DataLakeEnabled")
            .getState();
          var AribaRealm = this.getView().byId("AribaRealm").getValue();
          var SourcingApplication = this.getView()
            .byId("SourcingApplication")
            .getSelectedKey();
          var oSiteControlParams = {
            DataLakeEnabled,
            AribaRealm,
            SourcingApplication,
          };
          var AdminMo = this.getView().getModel("AdminMo");
          var endpoint = "/SiteControlParams";
          var SiteControlParamsModel =
            this.getView().getModel("SiteControlParams").oData;

          if (SiteControlParamsModel.dataAvailable == true) {
            endpoint = `${endpoint}(ID=${SiteControlParamsModel.ID})`;

            AdminMo.update(endpoint, oSiteControlParams, {
              method: "PUT",
              success: mySuccessHandler,
              error: myErrorHandler,
            });

            function mySuccessHandler(oRetrievedResult) {
              MessageToast.show(
                "Site Control Paramaters Configuration Update Successfully!"
              );
            }
            function myErrorHandler(oError) {
              console.log(oError);
              MessageToast.show(
                "Site Control Parameters: Failed to Update Configuration"
              );
            }
          } else {
            AdminMo.create(endpoint, oSiteControlParams, {
              success: (oRetrievedResult) => {
                MessageToast.show(
                  "Site Control Parameters Configuration Successfully Saved!"
                );
                this.getView()
                  .getModel("SiteControlParams")
                  .setProperty("/dataAvailable", true);
                this.getView()
                  .getModel("SiteControlParams")
                  .setProperty("/ID", oRetrievedResult.ID);
              },
              error: myErrorHandler,
            });

            function myErrorHandler(oError) {
              console.log(oError);
              MessageToast.show(
                "Site Control Params: Failed to save Configuration"
              );
            }
          }
        },
      }
    );
  }
);
