sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/UploadCollectionParameter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    Controller,
    MessageToast,
    UploadCollectionParameter,
    JSONModel,
    Device,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return Controller.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.Categories2RegionMap",
      {
        onInit: function () {
          var router = sap.ui.core.UIComponent.getRouterFor(this);
          router.attachRoutePatternMatched(this._handleRouteMatched, this);

          this.getView().setModel(new JSONModel(Device), "device");
          this.getView().setModel(new JSONModel({}), "Categories2RegionData");

          const initiatState = {
            isCategoriesLoading: false,
            dialogID: "ImportCategories2RegionDialog",
            popUpTitle: "Import Categories2Region",
            messageStrip:
              "Please Load CSV file to bulk import Categories2Region data in database.",
          };
          this.getView().setModel(
            new JSONModel(initiatState),
            "CsvUploadDialogConfig"
          );
          this.getView().setModel(this.getOwnerComponent().getModel("AdminMo"));
        },

        _handleRouteMatched: function (oEvent) {
          var oDataModel = this.getOwnerComponent().getModel("AdminMo");

          var _this = this;

          oDataModel.read("/Categories2Regions", {
            success: function (oData, response) {
              _this
                .getView()
                .getModel("Categories2RegionData")
                .setProperty("/data", oData.results);
            },
            error: function (oError) {
              //no entries available.. new insert
            },
          });
        },

        handleFiles: function (oEvent) {
          var oUploadCollection = oEvent.getSource();
          oUploadCollection.setUploadButtonInvisible(true);

          var oFileToRead = oEvent.getParameters().files["0"];

          var reader = new FileReader();

          // Read file into memory as UTF-8

          reader.readAsText(oFileToRead);

          // Handle errors load

          reader.onload = loadHandler;

          reader.onerror = errorHandler;

          function loadHandler(event) {
            var csv = event.target.result;

            processData(csv);
          }

          const processData = (csv) => {
            var allTextLines = csv.split(/\r\n|\n/);

            var lines = [];
            var fileColumnsHeader = allTextLines[0].split(";");
            fileColumnsHeader = fileColumnsHeader[0].split(",");

            for (var i = 1; i < allTextLines.length; i++) {
              var data = allTextLines[i].split(";");
              let eachData = {};

              if (Boolean(data[0])) {
                for (var j = 0; j < data.length; j++) {
                  const tentativeData = data[j].split(",");
                  for (var k = 0; k < tentativeData.length; k++) {
                    eachData[fileColumnsHeader[k]] = tentativeData[k];
                  }
                }

                lines.push(eachData);
              }
            }

            this.getView()
              .getModel("Categories2RegionData")
              .setProperty("/entities", lines);

            this.getView()
              .byId("UploadCollection")
              .getItems()[0]
              .attachDeletePress(function (params) {
                params.getSource().getParent().setUploadButtonInvisible(false);
                params.getSource().getParent().removeAllItems();
              });
          };

          function errorHandler(evt) {
            if (evt.target.error.name == "NotReadableError") {
              alert("Cannot read file !");
            }
          }
        },

        onFileDeleted: function (oEvent) {
          MessageToast.show("Event fileDeleted triggered");
        },

        onFilenameLengthExceed: function (oEvent) {
          MessageToast.show("Event filenameLengthExceed triggered");
        },

        onFileSizeExceed: function (oEvent) {
          MessageToast.show("Event fileSizeExceed triggered");
        },

        onTypeMissmatch: function (oEvent) {
          MessageToast.show("Event typeMissmatch triggered");
        },

        onStartUpload: function (oEvent) {
          var AdminModel = this.getOwnerComponent().getModel("AdminMo");
          const payloadData = this.getView().getModel(
            "Categories2RegionData"
          ).oData;
          const { entities } = payloadData;

          AdminModel.create(
            "/DoLoadCategories2Regions",
            { entities },
            {
              success: (oRetrievedResult) => {
                MessageToast.show(
                  "Categories2RegionData uploaded successfully!"
                );
                this._closeDialog();
                this._handleRouteMatched();
              },
              error: function myErrorHandler(oError) {
                console.log(oError);
                MessageToast.show(
                  "Create Categories2Region: Failed to save Configuration"
                );
              },
            }
          );
        },

        onBeforeUploadStarts: function (oEvent) {
          // Header Slug
          var oCustomerHeaderSlug = new UploadCollectionParameter({
            name: "slug",
            value: oEvent.getParameter("fileName"),
          });
          oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
          setTimeout(function () {
            MessageToast.show("Event beforeUploadStarts triggered");
          }, 4000);
        },

        onUploadComplete: function (oEvent) {
          var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
          setTimeout(
            function () {
              var oUploadCollection = this.byId("UploadCollection");

              for (var i = 0; i < oUploadCollection.getItems().length; i++) {
                if (
                  oUploadCollection.getItems()[i].getFileName() ===
                  sUploadedFileName
                ) {
                  oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
                  break;
                }
              }

              // delay the success message in order to see other messages before
              MessageToast.show("Event uploadComplete triggered");
            }.bind(this),
            8000
          );
        },
        onNavBack: function (oEvent) {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("Home", {}, true /*no history*/);
        },
        onSelectChange: function (oEvent) {
          var oUploadCollection = this.byId("UploadCollection");
          oUploadCollection.setShowSeparators(
            oEvent.getParameters().selectedItem.getProperty("key")
          );
        },

        onDownloadFile: function (oEvent) {
          const oMenuItem = oEvent.getSource();
          var menuItemText = oMenuItem.getText();
          var fileName = "categories_to_region_import_sample.csv";
          if (menuItemText === "Import Categories2Region User Sample CSV") {
            fileName = "categories_to_region_import_sample.csv";
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

        loadCsvDailog: function () {
          // Create and open Fragment 1
          if (!this.ImportDialog) {
            this.ImportDialog = sap.ui.xmlfragment(
              this.getView().getId(),
              "com.sap.pgp.dev.SupplierControlApp.fragment.CsvUploadDialog",
              this
            );
            this.getView().addDependent(this.ImportDialog);
          }
          return this.ImportDialog;
        },

        onOpenCategories2RegionsImportDialog: function () {
          this.loadCsvDailog().open();
        },

        _closeDialog: function (oEvent) {
          if (this.ImportDialog) {
            oEvent
              .getSource()
              .getParent()
              .getParent()
              .getContent()[0]
              .mAggregations.items[0].setUploadButtonInvisible(false);
            oEvent
              .getSource()
              .getParent()
              .getParent()
              .getContent()[0]
              .mAggregations.items[0].removeAllItems();

            this.ImportDialog.close();
          }
        },

        handleCategories2RegionsSearch: function (oEvent) {
          var oTable = this.getView().byId("Categories2RegionsTable");
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
              new Filter("CategoryDesc", FilterOperator.Contains, sQuery),
            ];
          }

          oTableBinding.filter(oTableSearchState, "Application");
        },
      }
    );
  }
);
