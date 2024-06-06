// @ts-nocheck
sap.ui.define(
  [
    "./BaseController",
    "sap/f/LayoutType",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} BaseController
   * @param {typeof sap.f.LayoutType} LayoutType
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {sap.m.MessageBox} MessageBox
   * @param {sap.m.MessageToast} MessageToast
   * @returns
   */
  function (BaseController, LayoutType, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.SupplierDetailDetail",
      {
        onInit: function () {
          // var oViewModel = new JSONModel({
          //     busy: true,
          //     delay: 0,
          //     editable: false
          // });

          this.getRouter()
            .getRoute("SupplierByCategory")
            .attachPatternMatched(this._onObjectMatched, this);

          // Store original busy indicator delay, so it can be restored later on
          var oFormID = this.byId("suplierdetaildetail");
          oFormID.setBusy(true);

          // this.setModel(oViewModel, "SupplierDetailView");

          // this.getOwnerComponent().getModel().metadataLoaded().then(function () {
          //     // Restore original busy indicator delay for the object view
          //     oViewModel.setProperty("/delay", iOriginalBusyDelay);
          // });
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler for navigating back.
         * We navigate back in the browser history
         * @public
         */
        onNavBack: function () {
          // eslint-disable-next-line sap-no-history-manipulation
          history.go(-1);
        },

        onShowMessages: function (oEvent) {
          var oShowMessagesButton = oEvent.getSource();
          this.openFragment("dev.vinibar.portal.settings.view.MessagePopover", {
            id: "idMessagePopover",
            openBy: oShowMessagesButton,
          });
        },

        onConfirm: function (oEvent) {
          this.getModel().resetChanges();
          sap.ui.getCore().getMessageManager().removeAllMessages();
          var oConfirmationPopover = this.byId("idConfirmationPopover");
          var oOpenedBy;
          if (oConfirmationPopover) {
            oConfirmationPopover.close();
            oOpenedBy = oConfirmationPopover.getOpenedBy();
          }

          this.getModel("SupplierDetailView").setProperty("/editable", false);
          // @ts-ignore
          var sId = oOpenedBy ? oOpenedBy.getId() : oEvent.getSource().getId();
          if (sId.includes("idCloseButton")) {
            this.getModel("CategoryView").setProperty(
              "/layout",
              LayoutType.OneColumn
            );
            this.getRouter().navTo("files");
          }
        },

        OnPressSave: async function (oEvent) {
          var Category = this.getView().byId("Category").getText();
          var Region = this.getView().byId("Region").getText();
          var ERPVendorId = this.getView().byId("ERPVendorId").getText();
          var SMVendorId = this.getView().byId("SMVendorId").getText();
          var ACMVendorId = this.getView().byId("ACMVendorId").getText();
          var AddressCity = this.getView().byId("AddressCity").getText();
          var SupplierName = this.getView().byId("SupplierName").getText();
          var PrimaryContactFirstName = this.getView()
            .byId("PrimaryContactFirstName")
            .getText();
          var PrimaryContactLastName = this.getView()
            .byId("PrimaryContactLastName")
            .getText();
          var PrimaryContactEMail = this.getView()
            .byId("PrimaryContactEMail")
            .getText();
          var AddressCountryCode = this.getView()
            .byId("AddressCountryCode")
            .getText();
          var Activated = this.getView().byId("TXAutoRFP").getSelected();
          var Activeflag = Activated === true ? "X" : "";

          var oAutoRFPData = {
            SupplierID: ERPVendorId,
            CategoryID: Category,
            RegionID: Region,
            SLPID: SMVendorId,
            ACMID: ACMVendorId,
            SupplierName: SupplierName,
            contactfn: PrimaryContactFirstName,
            contactln: PrimaryContactLastName,
            contactemail: PrimaryContactEMail,
            City: AddressCity,
            Country: AddressCountryCode,
            AutoRFQEligble: Activeflag,
          };

          var oDataModel = this.getOwnerComponent().getModel("AdminMo");
          var oFilter = new sap.ui.model.Filter(
            "ExternalOrganizationID",
            sap.ui.model.FilterOperator.EQ,
            ACMVendorId
          );
          oDataModel.read("/SupplierOrganization2Users", {
            filters: [oFilter],
            success: (oData) => {
              if (oData.results.length) {
                var EventsModel = this.getView().getModel("SupplierMo");

                var Eventparameter =
                  "/TailSpendSuppliers(ACMID='" +
                  ACMVendorId +
                  "',RegionID='" +
                  Region +
                  "',CategoryID='" +
                  Category +
                  "')";
                debugger;
                EventsModel.update(Eventparameter, oAutoRFPData, {
                  method: "PUT",
                  success: mySuccessHandler,
                  error: myErrorHandler,
                });
              }else{
                MessageToast.show(
                  "Supplier user is not available for " +
                    ACMVendorId +
                    ", Please create one before marking that supplier as preferred tail spend supplier."
                );
              }
            },
            error: function (oError) {
              myErrorHandler()
            },
          });

          function mySuccessHandler(oRetrievedResult) {
            MessageToast.show(
              "Auto RFP Event Configuration Successfully Saved"
            );
            // debugger;
          }
          function myErrorHandler(oError) {
            MessageToast.show("Auto RFP Event: Failed to save Configuration");
            // debugger;
          }
        },

        getSupplierDetailData: function (SMID, RegionID, CategoryID) {
          var _this = this;

          var oFormID = this.byId("suplierdetaildetail");
          oFormID.setBusy(true);

          var fnSuccess = function (data) {
            debugger;
            console.log(data, "data after oData response");
            var jsonobj = JSON.parse(data.d.doGetSupplierDetailData);

            var oViewModel = new JSONModel();

            _this.setModel(oViewModel, "SupplierDetailDetailMo");
            oViewModel.setData(jsonobj);

            var oCheckBox = _this.byId("TXAutoRFP");
            oCheckBox.setSelected(jsonobj.checked);

            var oFormiD = this.byId("suplierdetaildetail");
            oFormiD.setBusy(false);

            // var oSupplierDetailPanel = _this.getView().byId("idSupplierTable");

            // console.log("value of supplierdetailpanel", oSupplierDetailPanel);

            // oSupplierDetailPanel.bindElement({
            //     model: "SupplierDetailMo",
            //     path: "/SLPSupplier"
            // });
          }.bind(this);

          var fnError = function (oError) {
            console.log(oError);
            // this.getView().getModel("oViewModel").setProperty("/smbusy", false);
            MessageToast.show(
              "Could not fetch SM Data Information. " +
                oError.responseJSON.error.message.value
            );
          }.bind(this);

          const { AribaRealm } =
            this.getView().getModel("SiteControlParams").oData;
          console.log(AribaRealm, "ariba realm");
          var jdata = {
            realm: AribaRealm,
            SMID: SMID,
            Region: RegionID,
            Category: CategoryID,
          };

          $.ajax({
            type: "POST",
            url: "/backend/v2/sourcing/doGetSupplierDetailData",
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify(jdata),
            success: fnSuccess,
            error: fnError,
          });
        },

        getSupplierDetailDataLocalDB: function (SMID, RegionID, CategoryID) {
          var _this = this;

          var oFormID = this.byId("suplierdetaildetail");
          oFormID.setBusy(true);

          var fnSuccess = function (data) {
            debugger;
            const result = JSON.parse(
              data.d.doGetSupplierDetailDataFromLocalDB
            );
            console.log(result);
            if (Object.keys(result).length) var jsonobj = result;

            var oViewModel = new JSONModel();

            _this.setModel(oViewModel, "SupplierDetailDetailMo");
            oViewModel.setData(jsonobj);

            var oCheckBox = _this.byId("TXAutoRFP");
            oCheckBox.setSelected(jsonobj.checked);

            var oFormiD = this.byId("suplierdetaildetail");
            oFormiD.setBusy(false);
          }.bind(this);

          var fnError = function (oError) {
            console.log(oError);
            this.getView().getModel("oViewModel").setProperty("/smbusy", false);
            MessageToast.show(
              "Could not fetch SM Data Information. " +
                oError.responseJSON.error.message.value
            );
          }.bind(this);

          var jdata = {
            ACMID: SMID,
            Region: RegionID,
            Category: CategoryID,
          };

          $.ajax({
            type: "POST",
            url: "/backend/v2/sourcing/doGetSupplierDetailDataFromLocalDB",
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify(jdata),
            success: fnSuccess,
            error: fnError,
          });
        },

        _onObjectMatched: function (oEvent) {
          var sObjectId = oEvent.getParameter("arguments").objectId;
          var sLayout;
          var SMID;
          var isSMID;

          sLayout = sObjectId
            ? LayoutType.TwoColumnsBeginExpanded
            : LayoutType.OneColumn;

          if (sObjectId != undefined) {
            var nameArr = sObjectId.split("-");
            var CategoryID = nameArr[0];
            var RegionID = nameArr[1];
            var Supplier = nameArr[2];
            if (Supplier != undefined) {
              isSMID = Supplier.substr(0, 1);
            }
          }

          if (isSMID == "S" || isSMID == "A") {
            sLayout = LayoutType.ThreeColumnsEndExpanded;
            this.getModel("CategoryView").setProperty("/layout", sLayout);
          } else {
            sLayout = sObjectId
              ? LayoutType.TwoColumnsBeginExpanded
              : LayoutType.OneColumn;

            this.getModel("CategoryView").setProperty("/layout", sLayout);
          }

          this.getModel("CategoryView").setProperty("/layout", sLayout);

          //   this.getModel("SupplierDetailView").setProperty("/editable", false);

          if (!sObjectId) return;

          //    if ( isSMID != 'S')
          //    {
          //    console.log("sObjectId in Detail page is" , sObjectId);
          //    var nameArr = sObjectId.split('-');
          //    var CategoryID = nameArr[0];
          //    var RegionID = nameArr[1];
          //    console.log("CategoryID in Detail page is" , CategoryID);
          //    console.log("RegionID in Detail page is" , RegionID);

          //     var oViewModel = new JSONModel({
          //         RegionID: RegionID,
          //         CategoryID: CategoryID,
          //         editable: false
          //     });

          //     this.getSupplierData(CategoryID,RegionID);

          //     this.setModel(oViewModel, "SupplierDetailView");

          //     // var oSupplierDetailPanel = this.getView().byId("idSupplierTable");

          //     // console.log("value of supplierdetailpanel", oSupplierDetailPanel);

          //     // oSupplierDetailPanel.bindElement({
          //     //     model: "SupplierMo",
          //     //     path: "/Categories2Suppliers"
          //     // });

          // }
          // else
          if (isSMID == "S" || isSMID == "A") {
            var nameArr = sObjectId.split("-");

            var CategoryID = nameArr[0];
            var RegionID = nameArr[1];
            var SupplierID = nameArr[2];

            var oViewModel = new JSONModel({
              RegionID: RegionID,
              CategoryID: CategoryID,
            });

            var SiteControlParamsModel =
              this.getView().getModel("SiteControlParams").oData;

            if (SiteControlParamsModel.DataLakeEnabled) {
              this.getSupplierDetailData(SupplierID, RegionID, CategoryID);
            } else {
              this.getSupplierDetailDataLocalDB(
                SupplierID,
                RegionID,
                CategoryID
              );
            }

            this.setModel(oViewModel, "SupplierDetailView");
          }
        },

        /**
         * Validações realizadas ao trocar o bind da view
         * @private
         * @returns
         */
        _onBindingChange: function () {
          var oViewModel = this.getModel("SupplierDetailView");
          var oElementBinding = this.getView().getElementBinding();

          // No data for the binding
          if (!oElementBinding.getBoundContext()) {
            this.getRouter().getTargets().display("notFound");
            return;
          }

          oViewModel.setProperty("/busy", false);
        },

        /**
         * Alterna modo de edição
         * @private
         */
        _toggleEdit: function () {
          var oModel = this.getModel("SupplierDetailView");
          var bEditable = !oModel.getProperty("/editable");
          oModel.setProperty("/editable", bEditable);
        },
      }
    );
  }
);
