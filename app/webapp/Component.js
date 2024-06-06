sap.ui.define(
  [
    "sap/ui/core/library",
    "sap/ui/core/UIComponent",
    "./model/models",
    "sap/ui/core/routing/History",
    "sap/ui/Device",
    "sap/ui/model/resource/ResourceModel",
    "com/sap/pgp/dev/SupplierControlApp/handler/SessionTimeoutHandler",
    "sap/m/IllustrationPool",
  ],
  function (
    library,
    UIComponent,
    models,
    History,
    Device,
    ResourceModel,
    SessionTimeoutHandler,
    IllustrationPool
  ) {
    "use strict";

    return UIComponent.extend("com.sap.pgp.dev.SupplierControlApp.Component", {
      metadata: {
        manifest: "json",
        interfaces: [library.IAsyncContentCreation],
      },

      init: function () {
        // call the init function of the parent
        UIComponent.prototype.init.apply(this, arguments);

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        // create the views based on the url/hash
        this.getRouter().initialize();

        // Initialize the session timeout handler
        SessionTimeoutHandler.initiate(this);

			// call the base component's init function
			var oTntSet = {
				setFamily: "tnt",
				setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
			};

			// register tnt illustration set
			IllustrationPool.registerIllustrationSet(oTntSet, true);
         

      },

      myNavBack: function () {
        var oHistory = History.getInstance();
        var oPrevHash = oHistory.getPreviousHash();
        if (oPrevHash !== undefined) {
          window.history.go(-1);
        } else {
          this.getRouter().navTo("masterSettings", {}, true);
        }
      },

      getContentDensityClass: function () {
        if (!this._sContentDensityClass) {
          if (!Device.support.touch) {
            this._sContentDensityClass = "sapUiSizeCompact";
          } else {
            this._sContentDensityClass = "sapUiSizeCozy";
          }
        }
        return this._sContentDensityClass;
      },
    });
  }
);
