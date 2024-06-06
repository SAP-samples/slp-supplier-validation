// @ts-nocheck
sap.ui.define(
  [
    "./BaseController",
    "sap/f/LayoutType",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/m/Token',
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} BaseController
   * @param {typeof sap.f.LayoutType} LayoutType
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {sap.m.MessageBox} MessageBox
   * @param {sap.m.MessageToast} MessageToast
   * @returns
   */
  function (BaseController, LayoutType, JSONModel, MessageToast,Fragment,Filter,FilterOperator,Token) {
    "use strict";

    return BaseController.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.SourcingCockpitSupplier",
      {
        onInit: function () {
          var oDataModel = this.getOwnerComponent().getModel("AdminMo");
          this.getView().setModel(oDataModel,"SupplierServerModel")
          this.getView().setModel(
            new JSONModel({}),
            "SourcingCockpitSupplierModal"
          );

          this.getRouter()
            .getRoute("SourcingCockpit")
            .attachPatternMatched(this._onObjectMatched, this);
          // Store original busy indicator delay, so it can be restored later on
          var oTableID = this.byId("SupplierByPRCommodityTable");
          oTableID.setBusy(false);

          this.getView().addEventDelegate({
            onBeforeHide: () => {
              this.setModel(new JSONModel({}), "SourcingCockpitSupplierModal");
            },
          });
        },

        _onObjectMatched: function (oEvent) {
          var sObjectId = oEvent.getParameter("arguments").objectId;
          var sLayout = sObjectId
            ? LayoutType.TwoColumnsBeginExpanded
            : LayoutType.OneColumn;
          this.getModel("SourcingCockpitView").setProperty("/layout", sLayout);

          if (!sObjectId) return;

          var PRs = sObjectId.split("-");

          var PlantIDs = [];

          for (var i = 0; i < PRs.length; i++) {
            const temp = PRs[i].split("_");

            if (temp[0] === "PlantID" && !PlantIDs.includes(temp[1])) {
              PlantIDs.push(temp[1]);
            }
          }

          var oDataModel = this.getOwnerComponent().getModel("AdminMo");

          var _this = this;

          oDataModel.create(
            "/DoGetPreferredSuppliersForPR",
            { PlantID: PlantIDs.join(",") },
            {
              method: "POST",
              success: function (oData, response) {
                if (!oData.DoGetPreferredSuppliersForPR.length) {
                  _this
                    .getView()
                    .getModel("SourcingCockpitSupplierModal")
                    .setProperty("/supplierByCommodity", {});
                  _this
                    .getView()
                    .getModel("SourcingCockpitSupplierModal")
                    .setProperty(
                      "/supplierByCommodityError",
                      "Preferred Suppliers is not found for selected Purchase Requisition."
                    );
                } else {
                  var CommodityIDs = JSON.parse(
                    oData.DoGetPreferredSuppliersForPR
                  );

                  var newFilter = [];
                  CommodityIDs.map((CommodityID) => {
                    newFilter.push(
                      new sap.ui.model.Filter(
                        "Categories_CategoryID",
                        sap.ui.model.FilterOperator.EQ,
                        CommodityID
                      )
                    );
                  });

                  oDataModel.read("/Categories2Suppliers", {
                    filters: newFilter,
                    success: function (oData2, response) {
                      var suppliersData = oData2.results;
                      _this
                        .getView()
                        .getModel("SourcingCockpitSupplierModal")
                        .setProperty("/supplierByCommodity", suppliersData);
                      _this
                        .getView()
                        .getModel("SourcingCockpitSupplierModal")
                        .setProperty("/supplierByCommodityError", "");

                      var oTableID = _this.byId("SupplierByPRCommodityTable");
                      oTableID.setBusy(false);
                    },
                    error: function (oError) {
                      //no entries available.. new insert
                    },
                  });
                }
              },
              error: function (oError) {
                //no entries available.. new insert
              },
            }
          );

          oDataModel.read("/Suppliers", {
            success: function (oData2, response) {
              var suppliersData = oData2.results;

              _this
                .getView()
                .getModel("SourcingCockpitSupplierModal")
                .setProperty("/allSuppliers", suppliersData);
            },
            error: function (oError) {
              //no entries available.. new insert
            },
          });
        },

        handleSelectionFinish: function (oEvent) {
          var selectedItems = oEvent.getParameter("selectedItems");
          var supID = [];
          var tmpSuppliers = [];
          for (var i = 0; i < selectedItems.length; i++) {
            supID.push(selectedItems[i].getKey());
            tmpSuppliers.push({
              ACMID: selectedItems[i].getKey(),
              SupplierName: selectedItems[i].getText(),
            });
          }
          var { SelectedSuppliers } = this.getModel(
            "EventCreationPayload"
          ).oData;

          if (!Boolean(SelectedSuppliers)) SelectedSuppliers = [];
          const merged = [...SelectedSuppliers, ...tmpSuppliers];
          const uniqueData = [...new Set(merged.map((item) => item.ACMID))].map(
            (acmid) => merged.find((item) => item.ACMID === acmid)
          );

          this.getModel("EventCreationPayload").setProperty(
            "/SelectedSuppliers",
            uniqueData
          );

          this.getModel("SourcingCockpitSupplierModal").setProperty(
            "/ManuallySelectedSuppliers",
            supID
          );
        },
        onValueHelpRequest: function (oEvent) {
          var oView = this.getView();
    
          if (!this._pValueHelpDialog) {
            this._pValueHelpDialog = Fragment.load({
              id: oView.getId(),
              name: "com.sap.pgp.dev.SupplierControlApp.fragment.SupplierValueHelpDialog",
              controller: this
            }).then(function (oValueHelpDialog){
              oView.addDependent(oValueHelpDialog);
              return oValueHelpDialog;
            });
          }
          this._pValueHelpDialog.then(function(oValueHelpDialog){
           
            oValueHelpDialog.open();
            oValueHelpDialog.getBinding("items").filter([])
          }.bind(this));
        },
        onSearch: function(oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilterSupplier = new Filter("SupplierName", FilterOperator.Contains, sValue);
          var oFilterACMID = new Filter("ACMID", FilterOperator.Contains, sValue);
        
          var oFilter = new Filter({
            filters: [oFilterSupplier, oFilterACMID],
            and: false // use 'false' for OR condition
          });
        
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },
        onValueHelpDialogClose: function (oEvent) {
          var selectedItems=[]
          var aContexts = oEvent.getParameter("selectedContexts");
          var oInput = this.byId("manualSupplierSelectBox");
        
          if (aContexts && aContexts.length > 0) {
            var selectedValues = aContexts.map(function (oContext) {
          
              let supplierDetailsToken = new Token({
                key: oContext.getObject().SupplierID,
                text: oContext.getObject().SupplierName
              });
             
              return supplierDetailsToken;
            })

          
        
          //  MessageToast.show("You have chosen " + selectedValues);
        
            // Set the selected values in the input field
            oInput.setTokens(selectedValues);

            selectedItems = selectedValues;
            var supID = [];
            var tmpSuppliers = [];
            for (var i = 0; i < selectedItems.length; i++) {
              supID.push(selectedItems[i].getKey());
              tmpSuppliers.push({
                ACMID: selectedItems[i].getKey(),
                SupplierName: selectedItems[i].getText(),
              });
            }
            var { SelectedSuppliers } = this.getModel(
              "EventCreationPayload"
            ).oData;
  
            if (!Boolean(SelectedSuppliers)) SelectedSuppliers = [];
            const merged = [...SelectedSuppliers, ...tmpSuppliers];
            const uniqueData = [...new Set(merged.map((item) => item.ACMID))].map(
              (acmid) => merged.find((item) => item.ACMID === acmid)
            );
  
            this.getModel("EventCreationPayload").setProperty(
              "/SelectedSuppliers",
              uniqueData
            );
  
            this.getModel("SourcingCockpitSupplierModal").setProperty(
              "/ManuallySelectedSuppliers",
              supID
            );
  
  
          } else {
            MessageToast.show("No new item was selected.");
          }

        
        },
        

        reviewRFQCreation: function (oEvent) {
          var navRows = [];
          var SelectedACMIDs = [];
          //retriving selected PRs & PR items nav url data
          const { SelectedPRs } = this.getModel("EventCreationPayload").oData;

          if (Boolean(SelectedPRs)) {
            for (var i = 0; i < SelectedPRs.length; i++) {
              const string = "PlantID" + SelectedPRs[i].PlantID;
              navRows.push(string);
            }

            //getting ACMID of selected suppliers for Supplier by Commodity
            var oTable = this.byId("SupplierByPRCommodityTable");
            var selectedIndexes = oTable.getSelectedIndices();
            var tmpSuppliers = [];
            for (var i = 0; i < selectedIndexes.length; i++) {
              var RowData = oTable
                .getContextByIndex(selectedIndexes[i])
                .getObject();
              tmpSuppliers.push(RowData);
              SelectedACMIDs.push(RowData.ACMID);
            }

            var { SelectedSuppliers } = this.getModel(
              "EventCreationPayload"
            ).oData;

            if (!Boolean(SelectedSuppliers)) SelectedSuppliers = [];
            const merged = [...SelectedSuppliers, ...tmpSuppliers];
            const uniqueData = [
              ...new Set(merged.map((item) => item.ACMID)),
            ].map((acmid) => merged.find((item) => item.ACMID === acmid));

            this.getModel("EventCreationPayload").setProperty(
              "/SelectedSuppliers",
              uniqueData
            );

            //getting ACMID of selected suppliers by Manual Supplier Assignments
            const { ManuallySelectedSuppliers } = this.getModel(
              "SourcingCockpitSupplierModal"
            ).oData;

            if (Boolean(ManuallySelectedSuppliers))
              SelectedACMIDs = SelectedACMIDs.concat(ManuallySelectedSuppliers);

            if (SelectedACMIDs.length) navRows.push(SelectedACMIDs.join("&"));

            const unique = navRows.filter(
              (value, index, array) => array.indexOf(value) === index
            );

            const navString = unique.join("-");

            if (SelectedACMIDs.length) {
              this.getRouter().navTo("SourcingCockpit", {
                objectId: navString,
              });
            } else {
              MessageToast.show(
                "Please select at least one Supplier to proceed with RFQ creation."
              );
            }
          } else {
            MessageToast.show(
              "Please select at least one PR to proceed with RFQ creation."
            );
          }
        },

        clearSelection: function (evt) {
          this.byId("SupplierByPRCommodityTable").clearSelection();
          var oMultiInput = this.getView().byId("manualSupplierSelectBox");
          oMultiInput.removeAllTokens();
          this.getRouter().navTo("SourcingCockpit");
        },
      }
    );
  }
);
