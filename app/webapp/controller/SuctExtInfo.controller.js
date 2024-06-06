sap.ui.define(
  [
    "sap/m/library",
    "./BaseController",
    "sap/m/Dialog",
    "sap/ui/model/json/JSONModel",
    "sap/m/Button",
    "sap/m/MessageToast",
    "sap/m/Text",
    "sap/m/TextArea",
    "sap/m/ComboBox",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "sap/ui/core/Core",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/m/Token'
  ],
  function (
    mobileLibrary,
    Controller,
    Dialog,
    JSONModel,
    Button,
    MessageToast,
    Text,
    TextArea,
    ComboBox,
    HorizontalLayout,
    VerticalLayout,
    Core,
    DateFormat,
    Fragment,
    Filter,
    FilterOperator,
    Token
  ) {
    "use strict";

    return Controller.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.SuctExtInfo",
      {
        onInit: function () {
          var _this = this;

          this.setModel(
            new JSONModel({
              dataAvailable: false,
              showRestSettings: false,
            }),
            "RulesView"
          );

          _this.getView().addEventDelegate({
            onBeforeShow: () => {
              this.onFetchEventRule();
            },
            onBeforeHide: () => {
              _this.setModel(
                new JSONModel({
                  ..._this.getView().getModel("RulesView").oData,
                  dataAvailable: false,
                  showRestSettings: false,
                }),
                "RulesView"
              );
              _this.setModel(new JSONModel({}), "RulesModel");
            },
          });
        },


        onFetchEventRule: function (oEvent) {
          var oDataModel = this.getOwnerComponent().getModel("SupplierMo");
          const RulesViewModel = this.getView().getModel("RulesView").oData;
          let endpoint = "/SRegExternalIDs";
          endpoint = `${endpoint}(Realm='AribaRealm')`;

          oDataModel.read(endpoint, {
            success: (oData, response) => {
              var vDataAvailable = false;
              var oModel = new sap.ui.model.json.JSONModel();
              this.getView().setModel(oModel, "RulesModel");
              oModel.setData(oData);

              if (Object.keys(oData).length != 0) {
                vDataAvailable = true;
              }

              this.setModel(
                new JSONModel({
                  ...this.getView().getModel("RulesView").oData,
                  dataAvailable: vDataAvailable,
                }),
                "RulesView"
              );
            },
            error: (oError) => {
              if (oError.statusCode == 404)
                MessageToast.show(
                  "Ariba Realm details not available. Please add one in Site Control Params"
                );
              this.getView().setModel(new JSONModel({}), "RulesModel");
            },
          });
        },

        OnPressSave: function (oEvent) {

          debugger;
        
            var ValidationProcess = this.byId("ValidationProcess").getValue();
            if(!ValidationProcess)
            {
              var oMessage = new sap.m.MessageToast.show("Please enter value for Validation Process");
              throw oMessage;
             
            }

            var ValidationDate = this.byId("ValidationDate").getValue();
            if(!ValidationDate)
            {
              var oMessage = new sap.m.MessageToast.show("Please enter External Correlation for Validation Date");
              throw oMessage;
             
            }

            var IRSTin = this.byId("IRSTin").getValue();
            if(!IRSTin)
            {
              var oMessage = new sap.m.MessageToast.show("Please enter External Correlation ID for IRS TIN");
              throw oMessage;
             
            }

            var Ofac = this.byId("Ofac").getValue();
            if(!Ofac)
            {
              var oMessage = new sap.m.MessageToast.show("Please enter External correlation ID for OFAC field");
              throw oMessage;
             
            }

            var AddressValid = this.byId("AddressValid").getValue();
            if(!AddressValid)
            {
              var oMessage = new sap.m.MessageToast.show("Please enter External Correlation ID for Address Validation");
              throw oMessage;
             
            }

            var DocuSign = this.byId("DocuSign").getValue();
            if(!DocuSign)
            {
              var oMessage = new sap.m.MessageToast.show("Please enter External Correlation ID for DocuSign NDA");
              throw oMessage;
             
            }

          var oValidationRules = {
            Realm: 'AribaRealm',
            ValidationProcess: ValidationProcess,
            ValidationDate: ValidationDate,
            IRSTin: IRSTin,
            Ofac: Ofac,
            AddressValid: AddressValid,
            DocuSign: DocuSign,
          };

          var EventsModel = this.getView().getModel("SupplierMo");
          debugger;
          var Eventparameter = "/SRegExternalIDs";

          var RulesViewModel = this.getView().getModel("RulesView").oData;

          if (RulesViewModel.dataAvailable == true) {
            // get the CUID from Init Function

            Eventparameter = `${Eventparameter}(Realm='AribaRealm')`;

            EventsModel.update(Eventparameter, oValidationRules, {
              method: "PUT",
              success: mySuccessHandler,
              error: myErrorHandler,
            });

            function mySuccessHandler(oRetrievedResult) {
              MessageToast.show(
                "External Correlation ID for Registration Form Successfully Saved"
              );
              // debugger;
            }
            function myErrorHandler(oError) {
              console.log(oError);
              MessageToast.show(
                "External Correlation ID : Failed to save for Supplier Registration"
              );
              // debugger;
            }
          } else {
            debugger;
            EventsModel.create(Eventparameter, oAutoRFPRules, {
              success: (oRetrievedResult) => {
                MessageToast.show(
                  "External Correlation ID for Registration Form Successfully Saved"
                );
                this.getView()
                  .getModel("RulesView")
                  .setProperty("/dataAvailable", true);
              },
              error: myErrorHandler,
            });

            function myErrorHandler(oError) {
              console.log(oError);
              MessageToast.show("External Correlation ID : Failed to save for Supplier Registration");
            }
          } // end of else
        },
      }
    );
  }
);
