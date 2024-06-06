//@ts-nocheck
sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/f/LayoutType",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],

  function (
    BaseController,
    JSONModel,
    LayoutType,
    MessageToast,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return BaseController.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.SupplierByCategory",
      {
        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
          this.setModel(
            new JSONModel({
              layout: LayoutType.OneColumn,
            }),
            "CategoryView"
          );

          var oTableID = this.byId("idCategoryTable");
          oTableID.setBusy(true);

          this.getView().addEventDelegate({
            onBeforeShow: () => {
              this.fetchSiteControlParams();
            },
            onBeforeHide: () => {
              this.setModel(new JSONModel({}), "CategoryAgg");
            },
          });
        },

        fetchSiteControlParams: function () {
          var SiteControlParamsModel =
            this.getView().getModel("SiteControlParams").oData;

          const { DataLakeEnabled, AribaRealm } = SiteControlParamsModel;

          if (DataLakeEnabled) {
            this.getAccData(AribaRealm);
          } else {
            this.fetchCategoriesData();
          }
        },

        //fetching categories oData
        fetchCategoriesData: function (oEvent) {
          var oDataModel = this.getOwnerComponent().getModel("AdminMo");
          oDataModel.read("/Categories2Regions", {
            success: (oData) => {
              const localDbCategories = oData.results;

              const finalCategoryArray = localDbCategories.map((DbCat) => {
                DbCat["Category"] = DbCat["CategoryID"];
                DbCat["Name"] = DbCat["CategoryDesc"];
                DbCat["Region"] = DbCat["RegionID"];
                delete DbCat["CategoryID"],
                  DbCat["RegionID"],
                  DbCat["CategoryDesc"];

                return DbCat;
              });

              var oSMModel = this.getView().getModel("CategoryAgg");
              oSMModel.setData(finalCategoryArray);
              var oTableID = this.byId("idCategoryTable");
              oTableID.setBusy(false);
            },
            error: (oError) => {
              console.log(oError, "oError");
              MessageToast.show("Error while fetching the Categories");
            },
          });
        },

        getAccData: function (AribaRealm) {
          var _this = this;
          $.ajax({
            type: "GET",
            url: "/backend/v2/sourcing",
            headers: {
              "x-csrf-token": "Fetch",
            },
            success: function (data, textStatus, request) {
              var csrfToken = request.getResponseHeader("X-Csrf-Token");

              var fnSuccess = function (data) {
                debugger;
                var CategoryArr1 = JSON.parse(data.d.doGetCategoriesData);
                var oCatDesModel = _this.getView().getModel("CategoryDesc");
                var CategoryArr2 = oCatDesModel.getProperty("/CategoryDesc");

                const CategFinArray = CategoryArr1.map((item1) => {
                  const item2 = CategoryArr2.find(
                    (item) => item.UniqueName === item1.Category
                  );
                  if (item2) {
                    return {
                      ...item1,
                      ...item2,
                    };
                  }
                  return item1;
                });

                var oSMModel = _this.getView().getModel("CategoryAgg");
                oSMModel.setData(CategFinArray);
                var oTableID = _this.byId("idCategoryTable");
                oTableID.setBusy(false);
              }.bind(_this);

              var fnError = function (data) {
                console.log("Error in getAcc", data);
                var oTableID = _this.byId("idCategoryTable");
                oTableID.setBusy(false);
                MessageToast.show(
                  "Could not fetch SM Data Information. " +
                    data.responseJSON.error.message.value
                );
              }.bind(_this);

              //first call
              var jdata = {
                realm: AribaRealm,
              };

              $.ajax({
                type: "POST",
                url: "/backend/v2/sourcing/doGetCategoriesData",
                headers: {
                  "X-Csrf-Token": csrfToken,
                  "Content-Type": "application/json",
                },
                data: JSON.stringify(jdata),
                success: fnSuccess,
                error: fnError,
              });
            },
            error: function (data, request) {},
          });
        },

        showDetail: function (oEvent) {
          var CategoryID = oEvent
            .getParameter("listItem")
            .getBindingContext("CategoryAgg")
            .getProperty("Category");

          var regionID = oEvent
            .getParameter("listItem")
            .getBindingContext("CategoryAgg")
            .getProperty("Region");

          var sID = CategoryID + "-" + regionID;

          this.getRouter().navTo("SupplierByCategory", {
            objectId: sID,
          });
        },

        onFilterCategory: function (oEvent) {
          var oFilter = [];
          var sValue = oEvent.getParameter("query");

          debugger;
          if (sValue) {
            var oFilter = new Filter("Region", FilterOperator.Contains, sValue);
          }
          this.byId("idCategoryTable").getBinding("items").filter(oFilter);
        },
      }
    );
  }
);
