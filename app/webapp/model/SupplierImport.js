sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/m/MessageToast"],
  function (JSONModel, MessageToast) {
    "use strict";
    return {
      handleFiles: function (oEvent) {
        // Brijesh start
        var oUploadCollection = oEvent.getSource();
        oUploadCollection.setUploadButtonInvisible(true);
        // Brijesh end

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
          this.getView().setModel(
            new JSONModel({ entities: lines }),
            "SuppliersDataToImport"
          );

          sap.ui
            .getCore()
            .byId(
              "com.sap.pgp.dev.SupplierControlApp.fragment.ImportSuppliersDialog--UploadSupplier"
            )
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

      onStartUpload: function (oEvent) {
        this.getView()
          .getModel("SuppliersModel")
          .setProperty("/isSupplierImportLoading", true);
        var AdminModel = this.getOwnerComponent().getModel("AdminMo");
        const payloadData = this.getView().getModel(
          "SuppliersDataToImport"
        ).oData;

        AdminModel.create("/DoLoadSuppliers", payloadData, {
          success: (oRetrievedResult) => {
            this.getView()
              .getModel("SuppliersModel")
              .setProperty("/isSupplierImportLoading", false);
            MessageToast.show(oRetrievedResult.DoLoadSuppliers);
          },
          error: function myErrorHandler(oError) {
            console.log(oError);
            MessageToast.show("Create Supplier: Failed to save Configuration");
          },
        });
      },
    };
  }
);
