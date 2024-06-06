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
      "com.sap.pgp.dev.SupplierControlApp.controller.CategoryMap",
      {
        onInit: function () {
          this.getView().setModel(this.getOwnerComponent().getModel("AdminMo"));

          this.getView().setModel(new JSONModel(Device), "device");
          this.getView().setModel(new JSONModel({}), "CategoriesData");

          const initiatState = {
            isCategoriesLoading: false,
            dialogID: "ImportCategoriesDialog",
            popUpTitle: "Import Categories",
            messageStrip:
              "Please Load CSV file to bulk import Categories data in database.",
          };
          this.getView().setModel(
            new JSONModel(initiatState),
            "CsvUploadDialogConfig"
          );
        },
        _handleRouteMatched: function (oEvent) {
          var oDataModel = this.getOwnerComponent().getModel("AdminMo");

          var _this = this;

          oDataModel.read("/Categories", {
            success: function (oData, response) {
              _this
                .getView()
                .getModel("CategoriesData")
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
                  if (data[j].indexOf('"') >= 0) {
                    const tentativeData = data[j].split('"');
                    for (var k = 0; k < tentativeData.length - 1; k++) {
                      eachData[fileColumnsHeader[k]] = tentativeData[k].replace(
                        /,\s*$/,
                        ""
                      );
                    }
                  } else {
                    const tentativeData = data[j].split(",");
                    for (var k = 0; k < tentativeData.length; k++) {
                      eachData[fileColumnsHeader[k]] = tentativeData[k];
                    }
                  }
                }

                lines.push(eachData);
              }
            }

            this.getView()
              .getModel("CategoriesData")
              .setProperty("/entities", lines);

            if (this.getView().byId("UploadCollection").getItems().length > 0) {
              this.getView()
                .byId("UploadCollection")
                .getItems()[0]
                .attachDeletePress(function (params) {
                  params
                    .getSource()
                    .getParent()
                    .setUploadButtonInvisible(false);
                  params.getSource().getParent().removeAllItems();
                });
            }
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
          const payloadData = this.getView().getModel("CategoriesData").oData;
          const { entities } = payloadData;
          AdminModel.create(
            "/DoLoadCategories",
            { entities },
            {
              success: (oRetrievedResult) => {
                MessageToast.show("Categories uploaded successfully!");
                this._closeDialog();
                this._handleRouteMatched();
              },
              error: function myErrorHandler(oError) {
                console.log(oError);
                MessageToast.show(
                  "Create Category: Failed to save Configuration"
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
          var fileName = "categories_import_sample.csv";

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

        onOpenCategoriesImportDialog: function () {
          // Create and open Fragment 1
          if (!this.ImportDialog) {
            this.ImportDialog = sap.ui.xmlfragment(
              this.getView().getId(),
              "com.sap.pgp.dev.SupplierControlApp.fragment.CsvUploadDialog",
              this
            );
            this.getView().addDependent(this.ImportDialog);
          }

          this.ImportDialog.open();
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

        handleCategorySearch: function (oEvent) {
          var oTable = this.getView().byId("CategoryTable");
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
