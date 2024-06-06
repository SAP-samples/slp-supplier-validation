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
      debugger;
      window.sapdas = window.sapdas || {};
      window.sapdas.webclientBridge = window.sapdas.webclientBridge || {};

      window.sapdas.webclientBridge = {
          getBotPreferences: () => {
              return {
                  headerTitle: 'SAP Digital Assistant',
                  userInputPlaceholder: 'How can I help you?',
              };
          },
          onMessage: (payload, botName) => {
              const { messages } = payload
              // call controller function
              window.com.sap.pgp.dev.SupplierControlApp.controller.Home.prototype.handleJouleResponse( messages[messages.length-1] );
              // hiding Joule
              // sap.das.webclient.hide();
          }
      }

      // DAS Tenant properties
      var das_props = {
          url: 'https://sap-build-zuedubhc.eu12.sapdas-staging.cloud.sap/resources/public/webclient/bootstrap.js',
          botname: 'myda',
      };

      // Create and add the script
      var wc_script = document.createElement('script');

      wc_script.setAttribute('src', das_props.url);
      wc_script.setAttribute('data-bot-name', das_props.botname);
      wc_script.setAttribute('data-expander-type', 'CUSTOM');
      wc_script.setAttribute('data-expander-preferences', 'JTdCJTIyYWNjZW50Q29sb3IlMjIlM0ElMjIlMjNFMDVBNDclMjIlMkMlMjJiYWNrZ3JvdW5kQ29sb3IlMjIlM0ElMjIlMjNGRkZGRkYlMjIlMkMlMjJjb21wbGVtZW50YXJ5Q29sb3IlMjIlM0ElMjIlMjNGRkZGRkYlMjIlMkMlMjJvbmJvYXJkaW5nTWVzc2FnZSUyMiUzQSUyMkNvbWUlMjBzcGVhayUyMHRvJTIwbWUhJTIyJTJDJTIyZXhwYW5kZXJUaXRsZSUyMiUzQSUyMiUyMiUyQyUyMmV4cGFuZGVyTG9nbyUyMiUzQSUyMkNVWF9BdmF0YXIuc3ZnJTIyJTJDJTIydGhlbWUlMjIlM0ElMjJzYXBfaG9yaXpvbiUyMiU3RA==');

      wc_script.onload = () => {
          // Use the Web Client API to do some initialization if needed such as setting a different theme and showing the Web Client
          sap.das.webclient.setTheme('sap_horizon');
          sap.das.webclient.show();
      }

      document.head.appendChild(wc_script);
      

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
