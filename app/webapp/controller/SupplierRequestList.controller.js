sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/UploadCollectionParameter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
  ],
  function (
    Controller,
    MessageToast,
    UploadCollectionParameter,
    JSONModel,
    Device,
    Filter,
    FilterOperator,
    Fragment
  ) {
    "use strict";

    return Controller.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.SupplierRequestList",
      {
        onInit: function () {
          this.getView().setModel(new JSONModel(Device), "device");
          this.getView().setModel(new JSONModel({}), "SupplierRequestData");

          var router = sap.ui.core.UIComponent.getRouterFor(this);
          router.attachRoutePatternMatched(this._handleRouteMatched, this);

          const initiatState = {
            isCategoriesLoading: false,
            dialogID: "ProcessFlowDialog",
            popUpTitle: "Import Country to Region",
            messageStrip:
              "Please Load CSV file to bulk import Country2Region data in database.",
          };
          this.getView().setModel(
            new JSONModel(initiatState),
            "CsvUploadDialogConfig"
          );
          this.getView().setModel(this.getOwnerComponent().getModel("SupplierMo"));
        },

        _handleRouteMatched: function (oEvent) {
          var oDataModel = this.getOwnerComponent().getModel("SupplierMo");

          var _this = this;

          oDataModel.read("/SupplierRequest", {
            success: function (oData, response) {
              _this
                .getView()
                .getModel("SupplierRequestData")
                .setProperty("/data", oData.results);
            },
            error: function (oError) {
              //no entries available.. new insert
            },
          });
        },

        onDetailsPress: function (oEvent) {

          // Make a call to backend and try to Fetch Status table and get the Status..
          debugger;
          var oContext = oEvent.getSource().getBindingContext();
          var oRowData = oContext.getObject();
          console.log(oRowData);

          var jdata = {
            requesttype : "SupplierRequest",
            SRID: `${oRowData.SuppRequestID}`
          };
    
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("SupplierRequestDetails", {SRID: oRowData.SuppRequestID}, true /*no history*/);
        
        },

        // onDetailsPress: function (oEvent) {

        //   // Make a call to backend and try to Fetch Status table and get the Status..
        //   debugger;
        //   var oContext = oEvent.getSource().getBindingContext();
        //   var oRowData = oContext.getObject();
        //   console.log(oRowData);

        //   debugger;


        //   var jdata = {
        //     requesttype : "SupplierRequest",
        //     SRID: `${oRowData.SuppRequestID}`
        //   };
    
        //   var fnSuccess = function (data) {
        //     debugger;
        //     let PRStatus = JSON.parse(data.d.getSRStatus);
        

        //     if (PRStatus == "Registration Started") {
        //       var oModel = new JSONModel("model/data/ProcessFlowData4.json");
        //       this.getView().setModel(oModel, "ProcessFlow");
  
        //       this.oProcessFlow = sap.ui.getCore().byId("processflow")
        //     } else if (PRStatus == "Ariba Supplier Created") {
        //       var oModel = new JSONModel("model/data/ProcessFlowData3.json");
        //       this.getView().setModel(oModel, "ProcessFlow");
  
        //       this.oProcessFlow = sap.ui.getCore().byId("processflow")
        //     } else if (PRStatus == "SR Approval Complete") {
        //       var oModel = new JSONModel("model/data/ProcessFlowData2.json");
        //       this.getView().setModel(oModel, "ProcessFlow");
  
        //       this.oProcessFlow = sap.ui.getCore().byId("processflow")
        //     } else if (PRStatus == "Signature Completed") {
        //       var oModel = new JSONModel("model/data/ProcessFlowData1.json");
        //       this.getView().setModel(oModel, "ProcessFlow");
  
        //       this.oProcessFlow = sap.ui.getCore().byId("processflow")
        //     } else if (PRStatus == "SR Created") {
        //       var oModel = new JSONModel("model/data/ProcessFlowData.json");
        //       this.getView().setModel(oModel, "ProcessFlow");
        //       this.oProcessFlow = sap.ui.getCore().byId("processflow")
        //     } else if (PRStatus == "SR Supplier Request Rejected") {
        //       var oModel = new JSONModel("model/data/ProcessFlowData2a.json");
        //       this.getView().setModel(oModel, "ProcessFlow");
        //       this.oProcessFlow = sap.ui.getCore().byId("processflow")
        //     }

  
        //     var oView = this.getView();
        //     var that = this;
           
        //     if (!this.oProcessDialog) {
        //       // Load the fragment asynchronously
        //       Fragment.load({
        //         id: oView.getId(),
        //         name: "com/sap/pgp/dev/SupplierControlApp/fragment/ProcessFlowForSR",
        //         controller: this
        //       }).then(function (oFragment) {
        //         that.oProcessDialog = oFragment;
        //         oView.addDependent(oFragment);
        //         oFragment.open();
        //       });
        //     } else {
        //       // Dialog fragment is already loaded, just open it
        //       this.oProcessDialog.open();
        //     }

        //     // let orders = {
        //     //   orders:SRStatusData
        //     // }
        //     // var oModel = new JSONModel(orders);
        //     // this.getView().setModel(oModel,"SRModel");
    
        //   }.bind(this);
    
        //   var fnError = function (data) {
        //     console.log("Error in getting SRINformation", data);
    
        //   }.bind(this);
        //     $.ajax({
        //       type: "POST",
        //       url: "/backend/v2/sourcing/getSRStatus",
        //       headers: {
        //         "Content-Type": "application/json",
        //       },
        //       data: JSON.stringify(jdata),
        //       success: fnSuccess,
        //       error: fnError,
        //     });

        // //  let PRStatus = 'SR Created';

        
        // },

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
              .getModel("SupplierRequestData")
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

        onCancelPressForItemDialog: function (oEvent) {
          // Close the dialog fragment
          this.oProcessDialog.close();
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
          var AdminModel = this.getOwnerComponent().getModel("SupplierMo");
          const payloadData =
            this.getView().getModel("SupplierRequestData").oData;
          const { entities } = payloadData;

          AdminModel.create(
            "/doCountrytoRegionMapping",
            { entities },
            {
              success: (oRetrievedResult) => {
                MessageToast.show("Country2RegionData uploaded successfully!");
                this._closeDialog();
                this._handleRouteMatched();
              },
              error: function myErrorHandler(oError) {
                console.log(oError);
                MessageToast.show(
                  "Create Country2RegionData: Failed to save Configuration"
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
          var fileName = "country_to_region_import_sample.csv";

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

        onOpenCountry2RegionImportDialog: function () {
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

        handleCountry2RegionSearch: function (oEvent) {
          var oTable = this.getView().byId("SupplierRequestTable");
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
              new Filter("CountryID", FilterOperator.Contains, sQuery),
            ];
          }

          oTableBinding.filter(oTableSearchState, "Application");
        },
      }
    );
  }
);
