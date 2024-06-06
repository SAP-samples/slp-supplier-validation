// @ts-nocheck
sap.ui.define(
  [
    "./BaseController",
    "sap/f/LayoutType",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/syncStyleClass",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} BaseController
   * @param {typeof sap.f.LayoutType} LayoutType
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {sap.m.MessageBox} MessageBox
   * @param {sap.m.MessageToast} MessageToast
   * @returns
   */
  function (
    BaseController,
    LayoutType,
    JSONModel,
    MessageBox,
    MessageToast,
    syncStyleClass
  ) {
    "use strict";

    return BaseController.extend(
      "com.sap.pgp.dev.SupplierControlApp.controller.SourcingCockpitReview",
      {
        onInit: function () {
          this.getRouter()
            .getRoute("SourcingCockpit")
            .attachPatternMatched(this._onObjectMatched, this);

          // Store original busy indicator delay, so it can be restored later on
          /* var oFormID = this.byId("sourcingcockpitreview");
          oFormID.setBusy(true); */
        },

        onNavBack: function () {
          history.go(-1);
        },

        _onObjectMatched: function (oEvent) {
          var sObjectId = oEvent.getParameter("arguments").objectId;
          var sLayout;
          var ACMIDs = [];

          sLayout = sObjectId
            ? LayoutType.TwoColumnsBeginExpanded
            : LayoutType.OneColumn;

          if (sObjectId != undefined) {
            var nameArr = sObjectId.split("-");
            var Suppliers = nameArr[nameArr.length - 1];
            if (Suppliers.substring(0, 8) != "PlantID_") {
              ACMIDs = Suppliers.split("&");
            }
          }

          if (ACMIDs.length) {
            sLayout = LayoutType.ThreeColumnsEndExpanded;
            this.getModel("SourcingCockpitView").setProperty(
              "/layout",
              sLayout
            );
          } else {
            sLayout = sObjectId
              ? LayoutType.TwoColumnsBeginExpanded
              : LayoutType.OneColumn;

            this.getModel("SourcingCockpitView").setProperty(
              "/layout",
              sLayout
            );
          }

          this.getModel("SourcingCockpitView").setProperty("/layout", sLayout);

          if (!sObjectId) return;
        },

        clearSelection: function (evt) {
          var navRows = [];
          //retriving selected PRs & PR items nav url data
          const { SelectedPRs, SelectedSuppliers } = this.getModel(
            "EventCreationPayload"
          ).oData;
          if (Boolean(SelectedPRs)) {
            for (var i = 0; i < SelectedPRs.length; i++) {
              const string = "PlantID_" + SelectedPRs[i].PlantID;
              navRows.push(string);
            }
          }

          if (Boolean(SelectedSuppliers)) {
            this.getModel("EventCreationPayload").setProperty(
              "/SelectedSuppliers",
              []
            );
          }

          const unique = navRows.filter(
            (value, index, array) => array.indexOf(value) === index
          );

          const navString = unique.join("-");
          this.getRouter().navTo("SourcingCockpit", { objectId: navString });
        },

        assignSupplierRemove: function (oEvent) {
          var ACMID = oEvent.getSource().data("ACMID");
          const { SelectedSuppliers } = this.getModel(
            "EventCreationPayload"
          ).oData;
          var ACMIDs = [];
          if (Boolean(SelectedSuppliers) && SelectedSuppliers.length) {
            ACMIDs = SelectedSuppliers.map((data) => data.ACMID);
          }

          if (ACMIDs.includes(ACMID)) {
            ACMIDs.splice(ACMIDs.indexOf(ACMID), 1);

            for (var i = 0; i < SelectedSuppliers.length; i++) {
              var obj = SelectedSuppliers[i];
              if (ACMIDs.indexOf(obj.ACMID) === -1) {
                SelectedSuppliers.splice(i, 1);
              }
            }
            this.getModel("EventCreationPayload").setProperty(
              "/SelectedSuppliers",
              SelectedSuppliers
            );
          }

          var navRows = [];
          //retriving selected PRs & PR items nav url data
          const { SelectedPRs } = this.getModel("EventCreationPayload").oData;

          if (Boolean(SelectedPRs)) {
            for (var i = 0; i < SelectedPRs.length; i++) {
              const string = "PlantID_" + SelectedPRs[i].PlantID;
              navRows.push(string);
            }
          }
          if (ACMIDs.length != 0) {
            navRows.push(ACMIDs.join("&"));
          }

          const unique = navRows.filter(
            (value, index, array) => array.indexOf(value) === index
          );
          const navString = unique.join("-");

          this.getRouter().navTo("SourcingCockpit", {
            objectId: navString,
          });
        },

        createManualRFQEvent: function () {
          if (!this._pBusyDialog) {
            this._pBusyDialog = sap.ui.xmlfragment(
              "com.sap.pgp.dev.SupplierControlApp.fragment.BusyDialog",
              "com.sap.pgp.dev.SupplierControlApp.fragment.BusyDialog",
              this
            );
            this.getView().addDependent(this._pBusyDialog);
            syncStyleClass(
              "sapUiSizeCompact",
              this.getView(),
              this._pBusyDialog
            );
          }

          this._pBusyDialog.open();

          const { SelectedPRs, SelectedSuppliers } = this.getModel(
            "EventCreationPayload"
          ).oData;
          if (
            Boolean(SelectedPRs) &&
            Boolean(SelectedSuppliers) &&
            SelectedPRs.length &&
            SelectedSuppliers.length
          ) {
            const PRIDs = SelectedPRs.map((data) => data.PRID);
            const PRITEMs = SelectedPRs.map((data) => data.PRITEM);
            const ACMIDs = SelectedSuppliers.map((data) => data.ACMID);

            const fnSuccess = (data) => {
              this._pBusyDialog.close();
              MessageToast.show(data.d.doManuallyCreateEventfromPR);
            };

            var fnError = function (data) {
              this._pBusyDialog.close();
              MessageToast.show(
                "Manual RFQ creation failed due to some backend error"
              );
            }.bind(this);

            const payload = {
              PRIDs: JSON.stringify(PRIDs),
              PRITEMs: JSON.stringify(PRITEMs),
              ACMIDs: JSON.stringify(ACMIDs),
            };

            $.ajax({
              type: "POST",
              url: "/backend/v2/sourcing/doManuallyCreateEventfromPR",
              headers: {
                "Content-Type": "application/json",
              },
              data: JSON.stringify(payload),
              success: fnSuccess,
              error: fnError,
            });
          }
        },
      }
    );
  }
);
