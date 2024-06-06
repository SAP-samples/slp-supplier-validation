sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/ui/core/Fragment"],
  function (JSONModel, Fragment) {
    "use strict";

    return {
      initiate: function (oComponent) {
        this.fetchSessionTime(oComponent);
        this.attachUserActivityListeners(oComponent);
      },

      fetchSessionTime: function (oComponent) {
        oComponent.getModel("SToutModel").setData({ TimeOut: 3000000 });

        var oDataModel = oComponent.getModel("SupplierMo");
        var _this = oComponent;
        oDataModel.read("/doGetSessionTime", {
          success: (oData) => {
            _this
              .getModel("SToutModel")
              .setProperty(
                "/TimeOut",
                oData.doGetSessionTime.replace(/['"]+/g, "")
              );
            this.startSessionTimeout(oComponent);
          },
          error: function (oError) {
            console.log(oError, "oError");
            MessageToast.show("Error while fetching the Session Time");
          },
        });
      },

      startSessionTimeout: function (oComponent) {
        var SToutModel = oComponent.getModel("SToutModel").oData;
        const timeoutDuration = SToutModel.TimeOut;

        // Start a timer to check for session timeout
        this.sessionTimeoutTimer = setTimeout(
          function () {
            this.showSessionTimeoutDialog(oComponent);
          }.bind(this),
          timeoutDuration
        );
      },

      attachUserActivityListeners: function (oComponent) {
        // Attach event listeners to the document object
        document.addEventListener(
          "mousedown",
          function () {
            this.resetSessionTimeout(oComponent);
          }.bind(this)
        );
        document.addEventListener(
          "keydown",
          function () {
            this.resetSessionTimeout(oComponent);
          }.bind(this)
        );
      },

      resetSessionTimeout: function (oComponent) {
        // Reset the session timeout timer
        clearTimeout(this.sessionTimeoutTimer);
        this.startSessionTimeout(oComponent);
      },

      showSessionTimeoutDialog: function () {
        if (!this._oDialog) {
          Fragment.load({
            name: "com.sap.pgp.dev.SupplierControlApp.fragment.SessionTimeoutDialog",
            controller: this,
          }).then(
            function (oDialog) {
              this._oDialog = oDialog;

              this.onDialogOpen();
            }.bind(this)
          );
        } else {
          this.onDialogOpen();
        }
      },
      onDialogOpen: function () {
        this._oDialog.open();
      },
      onSignIn: function () {
        this.onDialogClose();
        sap.m.URLHelper.redirect("/", false);
      },

      onDialogClose: function () {
        this._oDialog.close();
        sap.m.URLHelper.redirect("/sct/logout", false);
      },
    };
  }
);
