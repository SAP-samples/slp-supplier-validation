sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
  ],
  function (BaseController, Filter, FilterOperator, MessageToast, Fragment) {
    "use strict";
    return BaseController.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.EventCockpit",
      {
        onInit: function () {
          var router = sap.ui.core.UIComponent.getRouterFor(this);
          router.attachRoutePatternMatched(this._handleRouteMatched, this);
        },

        _handleRouteMatched: function (oEvent) {
          if (oEvent.getParameter("name") == "EventCockpit") {
            var oDataModel = this.getOwnerComponent().getModel("SupplierMo");
            var _this = this;
            _this.getView().setModel(oDataModel);
            // oDataModel.read("/RFPEvent", {
            //   success: function (oData, response) {
            //     var oModel = new sap.ui.model.json.JSONModel();

            //     oModel.setData(oData);
            //   },
            //   error: function (oError) {
            //     //no entries available.. new insert
            //   },
            // });

            // this.getView().byId("rfpitemform").setVisible(false);
          }
        },

        onClose: function (oEvent) {
          this.getView().byId("rfpitemform").setVisible(false);
        },

        onDetailsPress: function (oEvent) {
          debugger;
          var ExportEventObject = oEvent
            .getSource()
            .getParent()
            .getBindingContext()
            .getObject();
          var DocumentID = ExportEventObject.DOCID;
          var oDataModel = this.getView().getModel("SupplierMo");
          var _this = this;

          oDataModel.read("/RFPItems", {
            filters: [
              new Filter("parent_DOCID", FilterOperator.EQ, DocumentID),
            ],
            success: function (oData, response) {
              console.log(oData);
              debugger;
              var oModel = new sap.ui.model.json.JSONModel();
              _this.getView().setModel(oModel, "RFPItemModel");
              oModel.setData(oData);
              _this._initializeAndLoadItemDialog(_this);
            },
            error: function (oError) {
              alert("Failure");
            },
          });
        },

        _initializeAndLoadItemDialog: function (that) {
          var oView = that.getView();
          if (!that.oItemDialog) {
            // Load the fragment asynchronously
            Fragment.load({
              id: oView.getId(),
              name: "com/sap/pgp/dev/SupplierControlApp/fragment/EventCockpitItemDetails",
              controller: that,
            }).then(function (oFragment) {
              that.oItemDialog = oFragment;
              oView.addDependent(oFragment);
              oFragment.open();
            });
          } else {
            // Dialog fragment is already loaded, just open it
            that.oItemDialog.open();
          }
        },
        onCancelPressForItemDialog: function () {
          this.oItemDialog.close();
        },

        onRefresh: function () {},
      }
    );
  }
);
