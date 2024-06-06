sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, JSONModel, Device, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.sap.pgp.dev.SupplierControlApp.controller.EventLog", {
      onInit: function () {
        this.getView().setModel(new JSONModel(Device), "device");
        this.getView().setModel(new JSONModel({}), "EventLogData");

        var router = sap.ui.core.UIComponent.getRouterFor(this);
        router.attachRoutePatternMatched(this._handleRouteMatched, this);
        this.getView().setModel(this.getOwnerComponent().getModel("AdminMo"));
      },

      _handleRouteMatched: function (oEvent) {
        var oDataModel = this.getOwnerComponent().getModel("AdminMo");

        var _this = this;

        oDataModel.read("/EventLogs", {
          success: function (oData, response) {
            _this
              .getView()
              .getModel("EventLogData")
              .setProperty("/entities", oData.results);
          },
          error: function (oError) {
            //no entries available.. new insert
          },
        });
      },

      handleEventLogSearch: function (oEvent) {
        var oTable = this.getView().byId("EventLogTable");
        if (!oTable) {
          console.error("Table not found");
          return;
        }

        var oTableBinding = oTable.getBinding("rows");

        if (!oTableBinding) {
          console.error("Table binding not found");
          return;
        }

        var oTableSearchState = [];
        var sQuery = oEvent.getParameter("query");

        if (sQuery && sQuery.length > 0) {
          oTableSearchState = [
            new Filter("EventName", FilterOperator.Contains, sQuery),
          ];
        }

        oTableBinding.filter(oTableSearchState, "Application");
      },
    });
  }
);
