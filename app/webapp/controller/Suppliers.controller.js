sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "com/sap/pgp/dev/SupplierControlApp/model/SupplierImport",
    "com/sap/pgp/dev/SupplierControlApp/model/SupplierUserImport",
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    BaseController,
    JSONModel,
    MessageToast,
    SupplierImport,
    SupplierUserImport,
    Fragment,
    syncStyleClass,
    Filter,
    FilterOperator
  ) {
    "use strict";
    return BaseController.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.Suppliers",
      {
        SupplierController: SupplierImport,
        SupplierUserController: SupplierUserImport,
        onInit: function () {
          var SupplierUser = [];

          this.setModel(new JSONModel({ SupplierUser }), "SupplierUser_object");
          var router = sap.ui.core.UIComponent.getRouterFor(this);
          router.attachRoutePatternMatched(this._handleRouteMatched, this);

          const initiatState = {
            isSupplierImportLoading: false,
            isSupplierUserImportLoading: false,
          };
          this.getView().setModel(
            new JSONModel(initiatState),
            "SuppliersModel"
          );
          this.getView().setModel(this.getOwnerComponent().getModel("AdminMo"))
        },

        _handleRouteMatched: function (oEvent) {
          var oDataModel = this.getOwnerComponent().getModel("AdminMo");

          var _this = this;

          oDataModel.read("/Suppliers", {
            success: function (oData, response) {
              _this
                .getView()
                .getModel("SuppliersModel")
                .setProperty("/SuppliersData", oData.results);
            },
            error: function (oError) {
              //no entries available.. new insert
            },
          });
        },

        onSyncDataFromAriba: function (oEvent) {
          // load BusyDialog fragment asynchronously
          if (!this._pBusyDialog) {
            this._pBusyDialog = sap.ui.xmlfragment(
              "com.sap.pgp.dev.SupplierControlApp.fragment.BusyDialog",
              "com.sap.pgp.dev.SupplierControlApp.fragment.BusyDialog",
              this
            );
            this.getView().addDependent(this._pBusyDialog);
            syncStyleClass(
              "sapUiSizeCompact",
              this.getView(),
              this._pBusyDialog
            );
          }

          this._pBusyDialog.open();

          const oMenuItem = oEvent.getSource();
          var menuItemText = oMenuItem.getText();
          if (menuItemText === "Sync Suppliers from Ariba") {
            this.startSyncingSuppliersFromAriba();
          } else if (menuItemText === "Sync Supplier Users from Ariba") {
            this.startSyncingSupplierUsersFromAriba();
          }
        },

        startSyncingSuppliersFromAriba: function (oEvent) {
          debugger;
          const fnSuccess = (data) => {
            MessageToast.show(data.d.DoPullSuppliersFromAriba);
            this._handleRouteMatched();
            this._pBusyDialog.close();
          };
          const fnError = (data) => {
            this._handleRouteMatched();
            this._pBusyDialog.close();
          };

          const siteCntrlParams =
            this.getView().getModel("SiteControlParams").oData;
          const { AribaRealm } = siteCntrlParams;

          const payload = { realm: AribaRealm };
          $.ajax({
            type: "POST",
            url: "/backend/v2/admin/DoPullSuppliersFromAriba",
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify(payload),
            success: fnSuccess,
            error: fnError,
          });
        },

        startSyncingSupplierUsersFromAriba: function (oEvent) {
          debugger;
          const fnSuccess = (data) => {
            MessageToast.show(data.d.DoPullSupplierUserFromAriba);
            this._handleRouteMatched();
            this._pBusyDialog.close();
          };
          const fnError = (data) => {
            this._handleRouteMatched();
            this._pBusyDialog.close();
          };

          const siteCntrlParams =
            this.getView().getModel("SiteControlParams").oData;
          const { AribaRealm } = siteCntrlParams;

          const payload = { realm: AribaRealm };
          $.ajax({
            type: "POST",
            url: "/backend/v2/admin/DoPullSupplierUserFromAriba",
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify(payload),
            success: fnSuccess,
            error: fnError,
          });
        },

        onDownloadFile: function (oEvent) {
          const oMenuItem = oEvent.getSource();
          var menuItemText = oMenuItem.getText();
          var fileName = "supplier_import_sample.csv";
          if (menuItemText === "Import Supplier User Sample CSV") {
            fileName = "supplier_user_import_sample.csv";
          }

          const fnSuccess = (data) => {
            const base64String = data.d.DownloadSampleCSVFile;
            // Specify the file name and MIME type

            var mimeType = "text/csv";

            // Construct the data URI
            var dataUri = "data:" + mimeType + ";base64," + base64String;

            // Create an anchor element to trigger the download
            var a = document.createElement("a");
            a.href = dataUri;
            a.download = fileName;

            // Trigger a click event on the anchor element
            a.click();
          };

          const fnError = (data) => {
            MessageToast.show(data.d.DownloadSampleCSVFile);
          };

          const payload = { fileName };
          $.ajax({
            type: "POST",
            url: "/backend/v2/admin/DownloadSampleCSVFile",
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify(payload),
            success: fnSuccess,
            error: fnError,
          });
        },

        onOpenSupplierImportDialog: function () {
          // Create and open Fragment 1
          if (!this.ImportSupplierDialog) {
            this.ImportSupplierDialog = sap.ui.xmlfragment(
              "com.sap.pgp.dev.SupplierControlApp.fragment.ImportSuppliersDialog",
              "com.sap.pgp.dev.SupplierControlApp.fragment.ImportSuppliersDialog",
              this
            );
            this.getView().addDependent(this.ImportSupplierDialog);
          }

          this.ImportSupplierDialog.open();
        },

        _closeSupplierDialog: function (oEvent) {
          if (this.ImportSupplierDialog) {
            oEvent.getSource().getParent().getParent().getContent()[0].mAggregations.items[0].setUploadButtonInvisible(false);
            oEvent.getSource().getParent().getParent().getContent()[0].mAggregations.items[0].removeAllItems();
            this.ImportSupplierDialog.close();
          }
        },

        onOpenSupplierUserImportDialog: function () {
          // Create and open Fragment 2
          if (!this.ImportSupplierUserDialog) {
            this.ImportSupplierUserDialog = sap.ui.xmlfragment(
              "com.sap.pgp.dev.SupplierControlApp.fragment.ImportSupplierUsersDialog",
              "com.sap.pgp.dev.SupplierControlApp.fragment.ImportSupplierUsersDialog",
              this
            );
            this.getView().addDependent(this.ImportSupplierUserDialog);
          }

          this.ImportSupplierUserDialog.open();
        },

        doSupplierUserDetails: function (oEvent) {
          var ExternalOrganization = oEvent.getSource().data("mydata");
          var oDataModel = this.getOwnerComponent().getModel("AdminMo");
          var SupplierUserFilter = new sap.ui.model.Filter({
            path: "ExternalOrganizationID",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: ExternalOrganization,
          });
          oDataModel.read("/SupplierOrganization2Users", {
            filters: [SupplierUserFilter],
            success: (oData, response) => {
              this.getModel("SupplierUser_object").setProperty(
                "/SupplierUser",
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
              name: "com.sap.pgp.dev.SupplierControlApp.view.fragments.SupplierUsers",
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

        _closeSupplierUserDialog: function (oEvent) {
          if (this.ImportSupplierUserDialog) {
            oEvent.getSource().getParent().getParent().getContent()[0].mAggregations.items[0].setUploadButtonInvisible(false);
            oEvent.getSource().getParent().getParent().getContent()[0].mAggregations.items[0].removeAllItems();
           
            this.ImportSupplierUserDialog.close();
          }
        },

        handleSupplierUsersSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter("FullName", FilterOperator.Contains, sValue);
          var oBinding = oEvent.getSource().getBinding("items");
          oBinding.filter([oFilter]);
        },

        handleSupplierSearch: function (oEvent) {
          var oTable = this.getView().byId("suppliersTable");
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
              new Filter("SupplierName", FilterOperator.Contains, sQuery),
            ];
          }

          oTableBinding.filter(oTableSearchState, "Application");
        },
      }
    );
  }
);
