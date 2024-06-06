sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "com/sap/pgp/dev/SupplierControlApp/model/formatter",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/syncStyleClass",
  ],
  function (
    BaseController,
    JSONModel,
    Device,
    formatter,
    Fragment,
    MessageToast,
    Filter,
    FilterOperator,
    syncStyleClass
  ) {
    "use strict";
    return BaseController.extend("com.sap.pgp.dev.SupplierControlApp.controller.Home", {
      formatter: formatter,

      onInit: function () {
        var oViewModel = new JSONModel({
          isPhone: Device.system.phone,
        });
        this.setModel(oViewModel, "view");
        this._oGlobalFilter = null;
        this._oPriceFilter = null;

        var router = sap.ui.core.UIComponent.getRouterFor(this);
        router.attachRoutePatternMatched(this._handleRouteMatched, this);


      },

      _handleRouteMatched: function (oEvent) {
        
       var _this = this;

      //  var oData = {
      //   orders: [
      //       {
      //           SRNumber: "Supplier Request: SR00001",
      //           SupplierName: "Supplier Name: ABC Inc",
      //           ApprovalState: "Approval State: SR Created",
      //           Stage1 : "Success",
      //           Stage2 : "Warning",
      //           Stage3 : "Warning",
      //           Stage4 : "Warning"
      //       },
      //       {
      //         SRNumber: "Supplier Request: SR00002",
      //         SupplierName: "Supplier Name: XYZ Inc",
      //         ApprovalState: "Approval State: NDA Signed",
      //         Stage1 : "Success",
      //         Stage2 : "Success",
      //         Stage3 : "Warning",
      //         Stage4 : "Warning"
      //     }
      //   ]
      // };

      debugger;
      var jdata = {
        requesttype : "SupplierRequest"
      };

      var fnSuccess = function (data) {
        debugger;
        let SRStatusData = JSON.parse(data.d.getSRInfo);
    
        let orders = {
          orders:SRStatusData
        }
        debugger;
        var oModel = new JSONModel(orders);
        _this.getView().setModel(oModel,"SRModel");

      }.bind(_this);

      var fnError = function (data) {
        console.log("Error in getting SRINformation", data);

      }.bind(_this);
        $.ajax({
          type: "POST",
          url: "/backend/v2/sourcing/getSRInfo",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(jdata),
          success: fnSuccess,
          error: fnError,
        });



      },

      formatJSONDate: function (date) {
        var oDate = new Date(Date.parse(date));
        return oDate.toLocaleDateString();
      },

      onNavToProcessFlow: function () {
        this.getRouter().navTo("SupplierRequest");
      },

      onNavToRequestOverview: function (oEvent) {
        debugger;
        
        let oLabel = oEvent.getSource();;
        let oParent = oEvent.getSource().getParent();
        // var oLabel1 = oVBox.getItems();
        // var oLabel1 = oVBox.getItems()[0];
        // var sLabelText = oLabel.getText();
        let LabelSR = oParent.mAggregations.content[0].mProperties.title; //SR Number first one in vbox

        const SRNumber = LabelSR.slice(-7);
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("SupplierRequestDetails", {SRID: SRNumber}, true /*no history*/);

        // this.getRouter().navTo("SupplierRequestList",{}, true /*no history*/ );
      },


      onNavToRequestOverviewHome: function (oEvent) {
        debugger;
        
        // let oLabel = oEvent.getSource();;
        // let oParent = oEvent.getSource().getParent();
        // // var oLabel1 = oVBox.getItems();
        // // var oLabel1 = oVBox.getItems()[0];
        // // var sLabelText = oLabel.getText();
        // let LabelSR = oParent.mAggregations.content[0].mProperties.title; //SR Number first one in vbox

        // const SRNumber = LabelSR.slice(-7);
        // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        // oRouter.navTo("SupplierRequestDetails", {SRID: SRNumber}, true /*no history*/);

        this.getRouter().navTo("SupplierRequestList",{}, true /*no history*/ );
      },

      onNavToAriba: function () {
        var sUrl = "https://s3.ariba.com/Buyer/Main?realm=AribaRealm";
        window.open(sUrl, "_blank");
      },

      onNavToInbox: function () {
        var sUrl = "https://integrated.launchpad.cfapps.sap.hana.ondemand.com/site?siteId=e4954ce3-5b5f-49f4-8fdd-d49c32cba7a7#Shell-home";
        window.open(sUrl, "_blank");
      },

      formatIcon: function(state) {
        switch (state) {
            case 'Success':
                return 'sap-icon://employee-approvals';
            case 'Warning':
                return 'sap-icon://employee-rejections';
            default:
                return 'sap-icon://employee-rejections';
        }
    },
    
    onSearch: function (oEvent) {
      debugger;
      var sMsg = oEvent.getSource().getValue();
      if (sMsg) {
          this._showBusyDialog(sMsg);
      }
  },

  handleJouleResponse: function (oMessage) {
    console.log(JSON.stringify(oMessage));

    var oContent = oMessage && oMessage.attachment && oMessage.attachment.content;
    var oButtonLink = oContent && oContent.buttons && oContent.buttons[0] && oContent.buttons[0].value;

    if (oButtonLink) {
        sap.m.URLHelper.redirect(oButtonLink, true);
    }
},

  _showBusyDialog: function (sMsg) {
    // load BusyDialog fragment asynchronously
    if (!this._pBusyDialog) {
        this._pBusyDialog = Fragment.load({
            name: "com.sap.pgp.dev.SupplierControlApp.view.fragments.BusyDialogFragment",
            controller: this
        }).then(function (oBusyDialog) {
            this.getView().addDependent(oBusyDialog);
            syncStyleClass("sapUiSizeCompact", this.getView(), oBusyDialog);
            return oBusyDialog;
        }.bind(this));
    }

    this._pBusyDialog.then(function(oBusyDialog) {
        oBusyDialog.open();
        window.sap.das.webclient.sendMessage(sMsg);
        window.sap.das.webclient.hide();
        this._simulateServerRequest(sMsg);
    }.bind(this));
},

_simulateServerRequest: function (sMsg) {
  // simulate a longer running operation
  var iTimeoutId = setTimeout(function() {
      this._pBusyDialog.then(function(oBusyDialog) {
          window.sap.das.webclient.hide();
          oBusyDialog.close();
      }.bind(this));
      window.sap.das.webclient.hide();
  }.bind(this), 2000);
},
    onNavToNews: function (event) {
        debugger;
        if (
          event.getSource().getId() ===
          "container-SupplierControlApp---home--tile-__tile3-0"
        ) {
          var sUrl = "https://www.youtube.com/watch?v=1cgtYJIrJRI";
          window.open(sUrl, "_blank");
        }
        if (
          event.getSource().getId() ===
          "container-SupplierControlApp---home--tile-__tile3-1"
        ) {
          var sUrl = "https://www.youtube.com/watch?v=gn9QD0ibI30";
          window.open(sUrl, "_blank");
        }
        if (
          event.getSource().getId() ===
          "container-SupplierControlApp---home--tile-__tile3-2"
        ) {
          var sUrl =
            "https://blogs.sap.com/2022/07/13/guided-sourcing-a-simple-solution-for-complex-sourcing/";
          window.open(sUrl, "_blank");
        }
        if (
          event.getSource().getId() ===
          "container-SupplierControlApp---home--tile-__tile3-3"
        ) {
          var sUrl = "https://www.youtube.com/watch?v=KQ_DC_81TMY";
          window.open(sUrl, "_blank");
        }
      },
      onNavToERP: function () {
        var sUrl =
          "https://c00000000549-l000372-44202.da-euw4.demo-education.cloud.sap";
        window.open(sUrl, "_blank");
      },

      filterGlobally: function (oEvent) {
        var sQuery = oEvent.getParameter("query");
        this._oGlobalFilter = null;

        if (sQuery) {
          this._oGlobalFilter = new Filter(
            [
              new Filter("Name", FilterOperator.Contains, sQuery),
              new Filter("Category", FilterOperator.Contains, sQuery),
              new Filter("Location", FilterOperator.Contains, sQuery),
              new Filter("AssetID", FilterOperator.Contains, sQuery),
            ],
            false
          );
        }

        this._filter();
      },

      _filter: function () {
        var oFilter = null;

        if (this._oGlobalFilter && this._oPriceFilter) {
          oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
        } else if (this._oGlobalFilter) {
          oFilter = this._oGlobalFilter;
        } else if (this._oPriceFilter) {
          oFilter = this._oPriceFilter;
        }

        this.byId("assettable").getBinding().filter(oFilter, "Application");
      },
      onDetailsPress: function (oEvent) {
        // var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
        // 	supplierPath = oEvent.getSource().getBindingContext("products").getPath(),
        // 	supplier = supplierPath.split("/").slice(-1).pop();
        // 	supplier = supplier.substring(21, supplier.length - 2);

        // 	this.oRouter.navTo("InventoryDetailDetail", {layout: oNextUIState.layout, product: this._product, supplier: supplier});
        // // MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));

        //	var oItem= this.getView().byId("assettable").getSelectedItem();
        //	var oEntry = oItem.getBindingContext("products").getObject();
        var selectedindex = this.getView()
          .byId("assettable")
          .getSelectedIndex();
        if (selectedindex >= 0) {
          // var productPath = oEvent.getSource().getBindingContext("assettable").getPath();
          // var oEntry = oEvent.getSource().getBindingContext("products").getObject();
          // var oItem= this.getView().byId("assettable");

          var oModel = this.getView().getModel("QuickViewAsset");
          this.openQuickView(oEvent, oModel);
        } else {
          MessageToast.show("Please select an Asset to see the Details");
        }
      },
      openQuickView: function (oEvent, oModel) {
        var oButton = oEvent.getSource(),
          oView = this.getView();

        if (!this._pQuickView) {
          this._pQuickView = Fragment.load({
            id: oView.getId(),
            name: "com.sap.pgp.dev.SupplierControlApp.view.QuickViewDialog",
            controller: this,
          }).then(function (oQuickView) {
            oView.addDependent(oQuickView);
            return oQuickView;
          });
        }
        this._pQuickView.then(function (oQuickView) {
          oQuickView.setModel(oModel);
          oQuickView.openBy(oButton);
        });
      },
    });
  }
);
