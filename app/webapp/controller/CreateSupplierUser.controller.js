sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/UploadCollectionParameter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
  ],
  function (
    Controller,
    MessageToast,
    UploadCollectionParameter,
    JSONModel,
    Device
  ) {
    "use strict";

    return Controller.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.CreateSupplierUser",
      {
        onInit: function () {
          this.getView().setModel(new JSONModel(Device), "device");
          this.getView().setModel(new JSONModel({}), "SupplierUsersData");
        },

        handleFiles: function (oEvent) {
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
                    if (fileColumnsHeader[k] != "EmailInvitationLastSentDate") {
                      eachData[fileColumnsHeader[k]] = tentativeData[k];
                    }
                  }
                }

                lines.push(eachData);
              }
            }

            this.getView().setModel(
              new JSONModel({ entities: lines }),
              "SupplierUsersData"
            );
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
          const payloadData =
            this.getView().getModel("SupplierUsersData").oData;

          AdminModel.create("/doCreateSupplierUser", payloadData, {
            success: (oRetrievedResult) => {
              MessageToast.show(oRetrievedResult.doCreateSupplierUser);
            },
            error: function myErrorHandler(oError) {
              console.log(oError);
              MessageToast.show(
                "Create Supplier User: Failed to save Configuration"
              );
            },
          });
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
      }
    );
  }
);
