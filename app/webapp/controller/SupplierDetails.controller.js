// @ts-nocheck
sap.ui.define(
  [
    "./BaseController",
    "sap/f/LayoutType",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} BaseController
   * @param {typeof sap.f.LayoutType} LayoutType
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {sap.m.MessageBox} MessageBox
   * @param {sap.m.MessageToast} MessageToast
   * @returns
   */
  function (
    BaseController,
    LayoutType,
    JSONModel,
    MessageBox,
    MessageToast,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return BaseController.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.SupplierDetails",
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
          var oTableID = this.byId("idSupplierTable");
          oTableID.setBusy(true);

          // this.setModel(oViewModel, "SupplierDetailView");

          // this.getOwnerComponent().getModel().metadataLoaded().then(function () {
          //     // Restore original busy indicator delay for the object view
          //     oViewModel.setProperty("/delay", iOriginalBusyDelay);
          // });

          this.getView().addEventDelegate({
            onBeforeHide: () => {
              this.setModel(new JSONModel({}), "SupplierDetailMo");
            },
          });
        },

        showSupplierDetail: function (oEvent) {
          var CategoryID = this.getView().byId("categoryid").getText();

          var regionID = this.getView().byId("region").getText();

          // var oEntry = oEvent.getParameter("listItem").getBindingContext("SupplierDetailMo");

          // var SMID = oEvent.getParameter("listItem").getBindingContext("SupplierDetailMo").getPath();

          var SMID = oEvent
            .getParameter("listItem")
            .getBindingContext("SupplierDetailMo")
            .getProperty("SLPSupplier/SMVendorId");

          // var SMID = oEntry.SLPSupplier.SMVendorId;
          //var SMID = oEvent.getParameter("listItem").getBindingContext("SupplierDetailMo").getProperty("SupplierDetailMo>SLPSupplier.SMVendorId");

          //console.log("binding context - get path" ,  oEvent.getParameter("listItem").getBindingContext("CategoryAgg").getPath());
          var sID = null;

          if (SMID != null) {
            sID = CategoryID + "-" + regionID + "-" + SMID;
          } else {
            sID = CategoryID + "-" + regionID;
          }

          // sID = CategoryID +'-'+regionID;

          // console.log("Value of Category ID" ,  oEvent.getParameter("listItem").getBindingContext("CategoryAgg").getProperty("Category"));

          // console.log("Value of regionID" ,  regionID);

          // this.getModel().resetChanges();

          this.getRouter().navTo("SupplierByCategory", {
            objectId: sID,
          });
        },

        getSupplierDataLocalDB: function (CategoryID) {
          var filter = new sap.ui.model.Filter(
            "Categories_CategoryID",
            sap.ui.model.FilterOperator.EQ,
            CategoryID
          );
          var oDataModel = this.getOwnerComponent().getModel("AdminMo");

          oDataModel.read("/Categories2Suppliers", {
            filters: [filter],
            success: (oData) => {
              var suppliersData = oData.results;

              suppliersData = suppliersData.map((DbCat) => {
                var SLPSupplier = {};
                SLPSupplier["SMVendorId"] = DbCat["ACMID"];
                SLPSupplier["SupplierName"] = DbCat["SupplierName"];
                SLPSupplier["AddressCountryCode"] = DbCat["SupplierCountry"];
                DbCat["SLPSupplier"] = SLPSupplier;
                return DbCat;
              });

              this.setModel(new JSONModel(suppliersData), "SupplierDetailMo");

              var oTableID = this.byId("idSupplierTable");
              oTableID.setBusy(false);
            },
            error: function (oError) {
              console.log(oError, "oError");
              MessageToast.show("Error while fetching the Suppliers");
            },
          });
        },

        getSupplierData: function (CategoryID, RegionID) {
          var _this = this;

          var oTableID = this.byId("idSupplierTable");
          oTableID.setBusy(true);

          var fnSuccess = function (data) {
            var jsonobj = JSON.parse(data.d.doGetSupplierData);

            this.setModel(new JSONModel(jsonobj), "SupplierDetailMo");

            var oTableID = this.byId("idSupplierTable");
            oTableID.setBusy(false);
          }.bind(this);

          var fnError = function (data) {
            console.log("inside success functino");
            // this.getView().getModel("oViewModel").setProperty("/smbusy", false);
            MessageToast.show(
              "Could not fetch SM Data Information. " +
                data.responseJSON.error.message.value
            );
          }.bind(this);

          var jdata = {
            realm: "StratusAtlantic",
            Category: CategoryID,
            Region: RegionID,
          };

          $.ajax({
            type: "POST",
            url: "/backend/v2/sourcing/doGetSupplierData",
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

          var sLayout = sObjectId
            ? LayoutType.TwoColumnsBeginExpanded
            : LayoutType.OneColumn;
          this.getModel("CategoryView").setProperty("/layout", sLayout);

          //   this.getModel("SupplierDetailView").setProperty("/editable", false);

          if (!sObjectId) return;

          //    var isSMID = sObjectId.substr(0,1);
          //    if ( isSMID == 'S')
          //    {
          //     //We already went till third layout.. so get the second one as category
          //    }
          var nameArr = sObjectId.split("-");
          var CategoryID = nameArr[0];
          var RegionID = nameArr[1];

          var oViewModel = new JSONModel({
            RegionID: RegionID,
            CategoryID: CategoryID,
            editable: false,
          });
          this.setModel(oViewModel, "SupplierDetailView");

          var SiteControlParamsModel =
            this.getView().getModel("SiteControlParams").oData;

          if (SiteControlParamsModel.DataLakeEnabled) {
            this.getSupplierData(CategoryID, RegionID);
          } else {
            this.getSupplierDataLocalDB(CategoryID);
          }
        },
      }
    );
  }
);
