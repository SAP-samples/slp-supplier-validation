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
      "com.sap.pgp.dev.SupplierControlApp.controller.ValidationCC",
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
          let endpoint = "/ValidationControls";
          endpoint = `${endpoint}(Realm='AribaRealm')`;

          oDataModel.read(endpoint, {
            success: (oData, response) => {
              var vDataAvailable = false;
              var oModel = new sap.ui.model.json.JSONModel();
              if (oData.SRDandB == null || oData.SRDandB == false ){oData.SRDandB = false;}
              if (oData.SRDocuSign == null || oData.SRDocuSign == false){oData.SRDocuSign = false;}
              if (oData.SRDuplicateERP == null || oData.SRDuplicateERP == false ){oData.SRDuplicateERP = false;}
              if (oData.SRGaddrcheck == null || oData.SRGaddrcheck == false)
               {
                  oData.SRGaddrcheck = false;
               }
              else
               {           
                  var oInput = this.getView().byId("ADDRID");
                   oInput.setVisible(true);
               }
              if (oData.SRGbankvalidation == null || oData.SRGbankvalidation == false){oData.SRGbankvalidation = false;}
              if (oData.SRGdocusign == null || oData.SRGdocusign == false ){oData.SRGdocusign = false;}
              if (oData.SRGduplicateerp == null || oData.SRGduplicateerp == false){oData.SRGduplicateerp = false;}
              if (oData.SRGein == null || oData.SRGein == false)
              {
                oData.SRGein = false;
              }
              else
              {
                var oInput = this.getView().byId("EINEXTID"); oInput.setVisible(true);
              }
              
              if (oData.SRGgdupariba == null || oData.SRGgdupariba == false){oData.SRGgdupariba = false; }
              if (oData.SRaddrcheck == null || oData.SRaddrcheck == false)
              {
                oData.SRaddrcheck = false;
              }
              else
              {
                var oInput = this.getView().byId("ADDRID"); oInput.setVisible(true);
              } 
              if (oData.SRGtin == null || oData.SRGtin == false)
              {
                oData.SRGtin = false;
              }
              else
              {
                var oInput = this.getView().byId("TINEXTID"); oInput.setVisible(true);
              } 
              if (oData.SRaddrcheck == null || oData.SRaddrcheck == false){oData.SRaddrcheck = false;}
              if (oData.SRdupariba == null || oData.SRdupariba == false){oData.SRdupariba = false;}
              if (oData.SRGofac == null || oData.SRGofac == false)
              {
                oData.SRGofac = false;
              }
              else
              {
                var oInput = this.getView().byId("OFACEXTID"); oInput.setVisible(true);
              }

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

        onsrgdandbChange: function(oEvent)
        {
          var bSwitchState = oEvent.getParameter("state");
          var oInputField = this.getView().byId("DandBEXTID");
          oInputField.setVisible(bSwitchState);
          

        },

        onsrgaddrcheck: function(oEvent)
        {

          var bSwitchState = oEvent.getParameter("state");
          var oInputField = this.getView().byId("ADDRID");
          oInputField.setVisible(bSwitchState);

        },


        onsrgofac: function(oEvent)
        {

          var bSwitchState = oEvent.getParameter("state");
          var oInputField = this.getView().byId("OFACEXTID");
          oInputField.setVisible(bSwitchState);

        },

        onsrgtin: function(oEvent)
        {
          var bSwitchState = oEvent.getParameter("state");
          var oInputField = this.getView().byId("TINEXTID");
          oInputField.setVisible(bSwitchState);

        },

        onsrgein: function(oEvent)
        {
          var bSwitchState = oEvent.getParameter("state");
          var oInputField = this.getView().byId("EINEXTID");
          oInputField.setVisible(bSwitchState);

        },

        OnPressSave: function (oEvent) {

          debugger;
        
          var SRaddrcheck = this.getView().byId("SRaddrcheck").getState();
          var SRdupariba = this.getView().byId("SRdupariba").getState();
          var SRDuplicateERP = this.getView().byId("SRDuplicateERP").getState();
          var SRDandB = this.getView().byId("SRDandB").getState();
          var SRDocuSign = this.getView().byId("SRDocuSign").getState();
     
          var srgaddrcheck = this.getView().byId("srgaddrcheck").getState();
          if (srgaddrcheck == true) 
          { 
            var osrgaddrInput = this.byId("ADDRID").getValue();
            if(!osrgaddrInput)
            {
              var oMessage = new sap.m.MessageToast.show("Please enter value for Address Check");
              throw oMessage;
             
            }
          }

          var srgdupariba = this.getView().byId("srgdupariba").getState();
          var srgduplicateerp = this.getView().byId("srgduplicateerp").getState();
          var srgdandb = this.getView().byId("srgdandb").getState();

          if (srgdandb == true) 
          { 
            var srgdandbInput = this.byId("DandBEXTID").getValue();
            if(!srgdandbInput)
            {
              var oMessage = new sap.m.MessageToast.show("Please enter value for D&B Check");
              throw oMessage;
            }
          }

          var srgdocusign = this.getView().byId("srgdocusign").getState();
          var srgofac = this.getView().byId("srgofac").getState();

          if (srgofac == true) 
          { 
            var srgofacinput = this.byId("OFACEXTID").getValue();
            if(!srgofacinput)
            {
              console.log("Please Input OFAC External Correlation ID");
              var oMessage = new sap.m.MessageToast.show("Please Input OFAC External Correlation ID");
              throw oMessage;
            }
          }


          var srgtin = this.getView().byId("srgtin").getState();

          if (srgtin == true) 
          { 
            var srgtinInput = this.byId("TINEXTID").getValue();
            if(!srgtinInput)
            {
              console.log("Please input TIN External ID");
              var oMessage = new sap.m.MessageToast.show("Please input TIN External ID");
              throw oMessage;
            }
          }

          var srgein = this.getView().byId("srgein").getState();

          if (srgein == true) 
          { 
            var srgeinInput = this.byId("EINEXTID").getValue();
            if(!srgeinInput)
            {
              console.log("Please input EIN external Correlation ID");
              var oMessage = new sap.m.MessageToast.show("Please Input EIN External Correlation ID");
              throw oMessage;
            }
          }

          var srgbankvalidation = this.getView().byId("srgbankvalidation").getState();

          var oValidationRules = {
            Realm: 'AribaRealm',
            SRaddrcheck: SRaddrcheck,
            SRdupariba: SRdupariba,
            SRDuplicateERP: SRDuplicateERP,
            SRDandB: SRDandB,
            SRDocuSign: SRDocuSign,
            SRGaddrcheck: srgaddrcheck,
            SRGAddrinput: osrgaddrInput,
            SRGgdupariba: srgdupariba,
            SRGduplicateerp: srgduplicateerp,
            srgdandb: srgdandb,
            srgdandbinput: srgdandbInput,
            SRGdocusign: srgdocusign,
            SRGofac: srgofac,
            SRGOFACinput: srgofacinput,
            SRGtin: srgtin,
            SRGtininput: srgtinInput,
            SRGein: srgein,
            SRGeininput: srgeinInput,
            SRGbankvalidation: srgbankvalidation,
          };

          var EventsModel = this.getView().getModel("SupplierMo");
          debugger;
          var Eventparameter = "/ValidationControls";

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
                "Validation Controls for Supplier Request and Registration Successfully Saved"
              );
              // debugger;
            }
            function myErrorHandler(oError) {
              console.log(oError);
              MessageToast.show(
                "Validation Controls : Failed to save for Supplier Request and Registration"
              );
              // debugger;
            }
          } else {
            debugger;
            EventsModel.create(Eventparameter, oAutoRFPRules, {
              success: (oRetrievedResult) => {
                MessageToast.show(
                  "Validation Controls for Supplier Request and Registration Successfully Saved"
                );
                this.getView()
                  .getModel("RulesView")
                  .setProperty("/dataAvailable", true);
              },
              error: myErrorHandler,
            });

            function myErrorHandler(oError) {
              console.log(oError);
              MessageToast.show("Validation Controls : Failed to save for Supplier Request and Registration");
            }
          } // end of else
        },
      }
    );
  }
);
