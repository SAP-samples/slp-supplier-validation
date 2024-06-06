sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
    "sap/f/LayoutType",
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    MessageToast,
    JSONModel,
    Fragment,
    syncStyleClass,
    LayoutType
  ) {
    "use strict";
    return BaseController.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.SourcingCockpit",
      {
        onInit: function () {
          this.setModel(
            new JSONModel({
              layout: LayoutType.OneColumn,
            }),
            "SourcingCockpitView"
          );

          this.setModel(new JSONModel({}), "EventCreationPayload");

          var PR_Service = [];
          this.setModel(new JSONModel({ PR_Service }), "PR_Service_object");

          this.getView().setModel(new JSONModel({}), "SourcingCockpitModel");
          var router = sap.ui.core.UIComponent.getRouterFor(this);
          router.attachRoutePatternMatched(this._handleRouteMatched, this);
        },
        
        _handleRouteMatched: function (oEvent) {
          if (oEvent.getParameter("name") == "SourcingCockpit") {
            var oDataModel = this.getOwnerComponent().getModel("SupplierMo");
            var _this = this;
            oDataModel.read("/doGetSourcingCockpit", {
              success: (oData, response) => {
                var NewoData = JSON.parse(oData.doGetSourcingCockpit);
                var oModel = new sap.ui.model.json.JSONModel();
                _this
                  .getModel("SourcingCockpitModel")
                  .setProperty("/data", NewoData);

                oModel.setData(NewoData);
              },
              error: function (oError) {
                //no entries available.. new insert
              },
            });
            //this.getView().byId("rfpitemform").setVisible(false);
          }
        },

        onClose: function (oEvent) {
          this.getView().byId("rfpitemform").setVisible(false);
        },

        onDetailsPress: function (oEvent) {
          debugger;
          var ExportEventObject = oEvent
            .getSource()
            .getBindingContext("RFPModel")
            .getObject();
          var DocumentID = ExportEventObject.DOCID;
          var oDataModel = this.getView().getModel("SupplierMo");
          var _this = this;

          oDataModel.read("/RFPItems", {
            filters: [
              new Filter("parent_DOCID", FilterOperator.EQ, DocumentID),
            ],
            success: function (oData, response) {
              debugger;
              var oModel = new sap.ui.model.json.JSONModel();
              _this.getView().setModel(oModel, "RFPItemModel");
              oModel.setData(oData);
              _this.getView().byId("rfpitemform").setVisible(true);
            },
            error: function (oError) {
              alert("Failure");
            },
          });
        },

        getSelectedIndices: function (oEvent) {
          var oTable = this.byId("eventstable");
          var selected = oTable.getSelectedIndices();
          if (selected.length) {
            var rowData = [];
            var PRIDs = [];
            var navRows = [];
            for (var i = 0; i < selected.length; i++) {
              var RowData = oTable.getContextByIndex(selected[i]).getObject();
              rowData.push(RowData);
              PRIDs.push(RowData.PRID);
              const string = "PlantID_" + RowData.PlantID;
              navRows.push(string);
            }
            this.getModel("EventCreationPayload").setProperty(
              "/SelectedPRs",
              rowData
            );
            if (PRIDs.every((val, i, arr) => val === arr[0])) {
              const unique = navRows.filter(
                (value, index, array) => array.indexOf(value) === index
              );
              const navString = unique.join("-");
              this.getRouter().navTo("SourcingCockpit", {
                objectId: navString,
              });
            } else {
              MessageToast.show(
                "PRID " +
                  PRIDs.join(",") +
                  " can not be grouped together, proceed with them seperately."
              );
              this.getRouter().navTo("SourcingCockpit");
            }
          } else {
            MessageToast.show(
              "Please select at least one PR to proceed with RFQ creation."
            );
          }
        },

        clearSelection: function (evt) {
          this.byId("eventstable").clearSelection();
          this.getRouter().navTo("SourcingCockpit");
        },

        onRefresh: function () {},

        handleTableSelectDialogPress: function (oEvent) {
          var pack_no = parseInt(oEvent.getSource().data("mydata"));
          var oDataModel = this.getOwnerComponent().getModel("SupplierMo");
          var oServiceItemFilter = new sap.ui.model.Filter({
            path: "PackageNoItem",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: pack_no + 1,
          });
          oDataModel.read("/ServiceItem", {
            filters: [oServiceItemFilter],
            success: (oData, response) => {
              this.getModel("PR_Service_object").setProperty(
                "/PR_Service",
                oData.results
              );
            },
            error: function (oError) {
              //no entries available.. new insert
            },
          });
          var oButton = oEvent.getSource(),
            oView = this.getView();

          if (!this._pDialog) {
            this._pDialog = Fragment.load({
              id: oView.getId(),
              name: "com.sap.pgp.dev.SupplierControlApp.view.fragments.PR_Services",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }

          this._pDialog.then(
            function (oDialog) {
              this._configDialog(oButton, oDialog);
              oDialog.open();
            }.bind(this)
          );
        },

        _configDialog: function (oButton, oDialog) {
          var sResponsivePadding = oButton.data("responsivePadding");
          var sResponsiveStyleClasses =
            "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";

          if (sResponsivePadding) {
            oDialog.addStyleClass(sResponsiveStyleClasses);
          } else {
            oDialog.removeStyleClass(sResponsiveStyleClasses);
          }

          // Set custom text for the confirmation button
          var sCustomConfirmButtonText = oButton.data("confirmButtonText");
          oDialog.setConfirmButtonText(sCustomConfirmButtonText);

          // toggle compact style
          syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
        },
        handlePRServiceSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter(
            "Subpackageshorttext",
            FilterOperator.Contains,
            sValue
          );
          var oBinding = oEvent.getSource().getBinding("items");
          oBinding.filter([oFilter]);
        },
      }
    );
  }
);
