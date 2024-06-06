sap.ui.define(
  [
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    'sap/ui/comp/library',
    'sap/ui/model/type/String',
    'sap/m/ColumnListItem',
    'sap/m/Label',
    'sap/m/SearchField',
    'sap/m/Token',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/odata/v2/ODataModel',
    'sap/ui/table/Column',
    'sap/m/Column',
    'sap/m/Text',
    'sap/m/MessagePopover',
	  'sap/m/MessageItem',
    'sap/m/MessageToast',
	  'sap/ui/core/message/Message',
    'sap/ui/core/Element',
    "sap/ui/core/library",
    "sap/m/library",
    "sap/m/Dialog" ,
    "sap/m/Button",
  ],
  function (
    BaseController,
    Controller, JSONModel, library, MessageBox, Fragment,compLibrary,TypeString, ColumnListItem, Label, SearchField, Token, Filter, FilterOperator, ODataModel, UIColumn, MColumn, Text, MessagePopover, MessageItem, MessageToast, Message, Element,coreLibrary,mobileLibrary,Dialog,Button
  ) 
  {
    "use strict";

    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

    var history = {
      prevPaymentSelect: null,
      prevDiffDeliverySelect: null
    };
  
    return Controller.extend("com.sap.pgp.dev.SupplierControlApp.controller.SupplierRequest", {
      onInit: function () {


        this._wizard = this.byId("SupplierWizard");
        this._oNavContainer = this.byId("navContainer");
        this._oDynamicPage = this.getPage();
  
        this.model = new JSONModel({});
 
        // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        // oRouter.getRoute("CreateSupplierUser").attachMatched(this._onRouteMatched,this);

        // debugger;

            // var radioButtonGroup = this.getView().byId("G001");
            // radioButtonGroup.setSelectedIndex(0);
           

            var oMultiInput, oMultiInputRegion;
            oMultiInput = this.byId("multiInput");
            oMultiInputRegion = this.byId("RegionMultiInput");

            oMultiInput.addValidator(this._onMultiInputValidate);
            oMultiInputRegion.addValidator(this._onMultiInputValidateRegion);


            this._oMultiInput = oMultiInput;
            this._oMultiInputRegion = oMultiInputRegion;
          
          this.model.setProperty("/SupplierRequest", {});
          
          this.model.updateBindings();

  
        this.getView().setModel(this.model);
        
        
      },

      onBeforeRendering: function() {
        // this.getView().getModel().setData({});
      },
      _onRouteMatched: function(oEvent)
      {
        debugger;
        // this.getView().getModel().setData({});
      },

      onExit: function() {
        if (this.oProductsModel) {
          this.oProductsModel.destroy();
          this.oProductsModel = null;
        }
      },
      getPage: function () {
        return this.byId("dynamicPage");
      },
       
      goToFinalStep: function () {
      //  debugger;
       var myCategoryArrayx = this.getView().getModel("regionmodel");
       var myCategoryArray = myCategoryArrayx.getProperty("/regiondata");
       var oMultiInput1 = this.getView().byId("tRegionMultiInput");
       oMultiInput1.setTokens(myCategoryArray);

      var myRegionArrayx = this.getView().getModel("categorymodel");
      var myRegionArray = myRegionArrayx.getProperty("/categorydata");
      var oMultiInput2 = this.getView().byId("tmultiInput");
      oMultiInput2.setTokens(myRegionArray);

      	// add validator
			var fnValidator = function(args){
				var text = args.text;

				return new Token({key: text, text: text});
			};

			oMultiInput1.addValidator(fnValidator);
			oMultiInput2.addValidator(fnValidator);

      },

      onValueHelpRequestedRegion: function() {

        this._oBasicSearchField = new SearchField();
        this.loadFragment({
          name: "com.sap.pgp.dev.SupplierControlApp.fragment.RegionValueHelpDialog"
        }).then(function(oDialog) {
          var oFilterBar = oDialog.getFilterBar(), oColumnRegionID, oColumnRegionName;
          this._oVHD = oDialog;
  
          this.getView().addDependent(oDialog);
  
          // Set key fields for filtering in the Define Conditions Tab
          oDialog.setRangeKeyFields([{
            label: "Region",
            key: "RegionID",
            type: "string",
            typeInstance: new TypeString({}, {
              maxLength: 7
            })
          }]);
  
          // Set Basic Search for FilterBar
          oFilterBar.setFilterBarExpanded(false);
          oFilterBar.setBasicSearch(this._oBasicSearchField);
  
          // Trigger filter bar search when the basic search is fired
          this._oBasicSearchField.attachSearch(function() {
            oFilterBar.search();
          });
  
          oDialog.getTableAsync().then(function (oTable) {
  
            var oDataModel = this.getOwnerComponent().getModel("AdminMo");
            oTable.setModel(oDataModel);
            if (oTable.bindRows) {
              // Bind rows to the ODataModel and add columns

              oTable.bindAggregation("rows", {
                path: "/Regions",
                events: {
                  dataReceived: function() {
                    oDialog.update();
                  }
                }
              });
              oColumnRegionID = new UIColumn({label: new Label({text: "Region ID"}), template: new Text({wrapping: false, text: "{RegionID}"})});
              oColumnRegionID.data({
                fieldName: "RegionID"
              });
              oColumnRegionName = new UIColumn({label: new Label({text: "Region Name"}), template: new Text({wrapping: false, text: "{RegionName}"})});
              oColumnRegionName.data({
                fieldName: "RegionName"
              });
              oTable.addColumn(oColumnRegionID);
              oTable.addColumn(oColumnRegionName);
            }
  
            // For Mobile the default table is sap.m.Table
            if (oTable.bindItems) {
              // Bind items to the ODataModel and add columns
              oTable.bindAggregation("items", {
                path: "/Regions",
                template: new ColumnListItem({
                  cells: [new Label({text: "{RegionID}"}), new Label({text: "{RegionName}"})]
                }),
                events: {
                  dataReceived: function() {
                    oDialog.update();
                  }
                }
              });
              oTable.addColumn(new MColumn({header: new Label({text: "Region ID"})}));
              oTable.addColumn(new MColumn({header: new Label({text: "Region Name"})}));
            }
            oDialog.update();
          }.bind(this));
  
          oDialog.setTokens(this._oMultiInputRegion.getTokens());
          oDialog.open();
        }.bind(this));
      },

      onValueHelpRequested: function() {

        this._oBasicSearchField = new SearchField();
        this.loadFragment({
          name: "com.sap.pgp.dev.SupplierControlApp.fragment.CategoryValueHelpDialog"
        }).then(function(oDialog) {
          var oFilterBar = oDialog.getFilterBar(), oColumnCategoryID, oColumnCategoryDesc;
          this._oVHD = oDialog;
  
          this.getView().addDependent(oDialog);
  
          // Set key fields for filtering in the Define Conditions Tab
          oDialog.setRangeKeyFields([{
            label: "Product",
            key: "CategoryID",
            type: "string",
            typeInstance: new TypeString({}, {
              maxLength: 7
            })
          }]);
  
          // Set Basic Search for FilterBar
          oFilterBar.setFilterBarExpanded(false);
          oFilterBar.setBasicSearch(this._oBasicSearchField);
  
          // Trigger filter bar search when the basic search is fired
          this._oBasicSearchField.attachSearch(function() {
            oFilterBar.search();
          });
  
          oDialog.getTableAsync().then(function (oTable) {
  
            var oDataModel = this.getOwnerComponent().getModel("AdminMo");
            oTable.setModel(oDataModel);
            if (oTable.bindRows) {
              // Bind rows to the ODataModel and add columns
         
              oTable.bindAggregation("rows", {
                path: "/Categories",
                events: {
                  dataReceived: function() {
                    oDialog.update();
                  }
                }
              });
              oColumnCategoryID = new UIColumn({label: new Label({text: "Category ID"}), template: new Text({wrapping: false, text: "{CategoryID}"})});
              oColumnCategoryID.data({
                fieldName: "CategoryID"
              });
              oColumnCategoryDesc = new UIColumn({label: new Label({text: "Category Name"}), template: new Text({wrapping: false, text: "{CategoryDesc}"})});
              oColumnCategoryDesc.data({
                fieldName: "CategoryDesc"
              });
              oTable.addColumn(oColumnCategoryID);
              oTable.addColumn(oColumnCategoryDesc);
            }
  
            // For Mobile the default table is sap.m.Table
            if (oTable.bindItems) {
              // Bind items to the ODataModel and add columns
              oTable.bindAggregation("items", {
                path: "/Categories",
                template: new ColumnListItem({
                  cells: [new Label({text: "{CategoryID}"}), new Label({text: "{CategoryDesc}"})]
                }),
                events: {
                  dataReceived: function() {
                    oDialog.update();
                  }
                }
              });
              oTable.addColumn(new MColumn({header: new Label({text: "Category ID"})}));
              oTable.addColumn(new MColumn({header: new Label({text: "Category Name"})}));
            }
            oDialog.update();
          }.bind(this));
  
          oDialog.setTokens(this._oMultiInput.getTokens());
          oDialog.open();
        }.bind(this));
      },

      OnSelectNDA: function (oEvent) 
      {
        var selectedIndex = oEvent.getParameter("selectedIndex");
        this.getView().getModel().setProperty("/selectedNDAIndex",selectedIndex);
      },
      
      OnSelectDiligence: function (oEvent) 
      {
        var selectedIndex = oEvent.getParameter("selectedIndex");
        this.getView().getModel().setProperty("/selectedDiligenceIndex",selectedIndex);
      },

      onValueHelpOkPress: function (oEvent) {
        // debugger;
        var aTokens = oEvent.getParameter("tokens");
        var categorymodel = new JSONModel({categorydata:aTokens});
        this.getView().setModel(categorymodel, "categorymodel");
        this._oMultiInput.setTokens(aTokens);
        
        // this._otMultiInput.setTokens(aTokens); //for display

        this._oVHD.close();
      },
  
      onValueHelpOkPressRegion: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        this._oMultiInputRegion.setTokens(aTokens);
        // this.getView().getModel().setData({RegionsData: aTokens});
        // this._otMultiInputRegion.setTokens(aTokens); //display

        var regionmodel = new JSONModel({regiondata:aTokens});
        this.getView().setModel(regionmodel, "regionmodel");

        this._oVHD.close();
      },

      onValueHelpCancelPress: function () {
        this._oVHD.close();
      },
  
      onValueHelpAfterClose: function () {
        this._oVHD.destroy();
      },
      
      _inputTextFormatter: function (oItem) {
        var sOriginalText = oItem.getText(),
          sWhitespace = " ",
          sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace
  
        if (typeof sOriginalText !== "string") {
          return sOriginalText;
        }
  
        return sOriginalText
          .replaceAll((sWhitespace + sUnicodeWhitespaceCharacter), (sWhitespace + sWhitespace));
      },
      whitespace2Char: function (sOriginalText) {
        var sWhitespace = " ",
          sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace
  
        if (typeof sOriginalText !== "string") {
          return sOriginalText;
        }
  
        return sOriginalText
          .replaceAll((sWhitespace + sWhitespace), (sWhitespace + sUnicodeWhitespaceCharacter)); // replace spaces
      },
      // #endregion
      onFilterBarSearch: function (oEvent) {
        var sSearchQuery = this._oBasicSearchField.getValue(),
          aSelectionSet = oEvent.getParameter("selectionSet");
  
        var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
          if (oControl.getValue()) {
            aResult.push(new Filter({
              path: oControl.getName(),
              operator: FilterOperator.Contains,
              value1: oControl.getValue()
            }));
          }
  
          return aResult;
        }, []);
  
        aFilters.push(new Filter({
          filters: [
            new Filter({ path: "CategoryID", operator: FilterOperator.Contains, value1: sSearchQuery }),
            new Filter({ path: "CategoryDesc", operator: FilterOperator.Contains, value1: sSearchQuery })
          ],
          and: false
        }));
  
        this._filterTable(new Filter({
          filters: aFilters,
          and: true
        }));
      },
      onFilterBarWhitespacesSearch: function (oEvent) {
        var sSearchQuery = this._oBasicSearchField.getValue(),
          aSelectionSet = oEvent.getParameter("selectionSet");
  
        var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
          if (oControl.getValue()) {
            aResult.push(new Filter({
              path: oControl.getName(),
              operator: FilterOperator.Contains,
              value1: oControl.getValue()
            }));
          }
  
          return aResult;
        }, []);
  
        aFilters.push(new Filter({
          filters: [
            new Filter({ path: "CategoryID", operator: FilterOperator.Contains, value1: sSearchQuery }),
            new Filter({ path: "CategoryDesc", operator: FilterOperator.Contains, value1: sSearchQuery })
          ],
          and: false
        }));
  
        this._filterTableWhitespace(new Filter({
          filters: aFilters,
          and: true
        }));
      },
  
      _filterTableWhitespace: function (oFilter) {
        var oValueHelpDialog = this.oWhitespaceDialog;
        oValueHelpDialog.getTableAsync().then(function (oTable) {
          if (oTable.bindRows) {
            oTable.getBinding("rows").filter(oFilter);
          }
          if (oTable.bindItems) {
            oTable.getBinding("items").filter(oFilter);
          }
          oValueHelpDialog.update();
        });
      },
      onWhitespaceOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        aTokens.forEach(function (oToken) {
          oToken.setText(this.whitespace2Char(oToken.getText()));
        }.bind(this));
        this._oWhiteSpacesInput.setTokens(aTokens);
        this.oWhitespaceDialog.close();
      },
      onWhitespaceCancelPress: function () {
        this.oWhitespaceDialog.close();
      },
      onWhitespaceAfterClose: function () {
        this.oWhitespaceDialog.destroy();
      },
     
      _onMultiInputValidate: function(oArgs) {
        // debugger;
        var sWhitespace = " ",
          sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace
  
        if (oArgs.suggestionObject) {
          var oObject = oArgs.suggestionObject.getBindingContext().getObject(),
            oToken = new Token(),
            sOriginalText = oObject.CategoryID.replaceAll((sWhitespace + sWhitespace), (sWhitespace + sUnicodeWhitespaceCharacter));
  
          oToken.setKey(oObject.CategoryID);
          oToken.setText(oObject.CategoryDesc + " (" + sOriginalText + ")");
          return oToken;
        }
        return null;
      },
      _onMultiInputValidateRegion: function(oArgs) {
        // debugger;
        var sWhitespace = " ",
          sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace
  
        if (oArgs.suggestionObject) {
          var oObject = oArgs.suggestionObject.getBindingContext().getObject(),
            oToken = new Token(),
            sOriginalText = oObject.RegionID.replaceAll((sWhitespace + sWhitespace), (sWhitespace + sUnicodeWhitespaceCharacter));
  
          oToken.setKey(oObject.RegionID);
          oToken.setText(oObject.RegionName + " (" + sOriginalText + ")");
          return oToken;
        }
        return null;
      },
      _filterTable: function (oFilter) {
        var oVHD = this._oVHD;
  
        oVHD.getTableAsync().then(function (oTable) {
          if (oTable.bindRows) {
            oTable.getBinding("rows").filter(oFilter);
          }
          if (oTable.bindItems) {
            oTable.getBinding("items").filter(oFilter);
          }
  
          // This method must be called after binding update of the table.
          oVHD.update();
        });
      },
  
      setDiscardableProperty: function (params) {
        if (this._wizard.getProgressStep() !== params.discardStep) {
          MessageBox.warning(params.message, {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                this._wizard.discardProgress(params.discardStep);
                history[params.historyPath] = this.model.getProperty(params.modelPath);
              } else {
                this.model.setProperty(params.modelPath, history[params.historyPath]);
              }
            }.bind(this)
          });
        } else {
          history[params.historyPath] = this.model.getProperty(params.modelPath);
        }
      },
  
      billingAddressComplete: function () {
        if (this.model.getProperty("/differentDeliveryAddress")) {
          this.byId("BillingStep").setNextStep(this.getView().byId("DeliveryAddressStep"));
        } else {
          this.byId("BillingStep").setNextStep(this.getView().byId("DeliveryTypeStep"));
        }
      },
  
      handleWizardCancel: function () {
        this._handleMessageBoxOpen("Are you sure you want to cancel your Supplier Request?", "warning");
      },
  
      handleWizardSubmit: function () {
        this._handleMessageBoxOpen("Ready to Submit your Supplier Request?", "confirm");
      },
  
      backToWizardContent: function () {
        this._oNavContainer.backToPage(this._oDynamicPage.getId());
      },
  
      checkCreditCardStep: function () {
        var cardName = this.model.getProperty("/CreditCard/Name") || "";
        if (cardName.length < 3) {
          this._wizard.invalidateStep(this.byId("CreditCardStep"));
        } else {
          this._wizard.validateStep(this.byId("CreditCardStep"));
        }
      },
  
      checkCashOnDeliveryStep: function () {
        var firstName = this.model.getProperty("/CashOnDelivery/FirstName") || "";
        if (firstName.length < 3) {
          this._wizard.invalidateStep(this.byId("CashOnDeliveryStep"));
        } else {
          this._wizard.validateStep(this.byId("CashOnDeliveryStep"));
        }
      },
  
      checkBillingStep: function () {
        var address = this.model.getProperty("/BillingAddress/Address") || "";
        var city = this.model.getProperty("/BillingAddress/City") || "";
        var zipCode = this.model.getProperty("/BillingAddress/ZipCode") || "";
        var country = this.model.getProperty("/BillingAddress/Country") || "";
  
        if (address.length < 3 || city.length < 3 || zipCode.length < 3 || country.length < 3) {
          this._wizard.invalidateStep(this.byId("BillingStep"));
        } else {
          this._wizard.validateStep(this.byId("BillingStep"));
        }
      },
  
      completedHandler: function () {
        this._oNavContainer.to(this.byId("wizardBranchingReviewPage"));
      },
  
      _handlefinalClose: function (sMessage, sMessageBoxType) {
        MessageBox[sMessageBoxType](sMessage, {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.YES) {
              //Return to Home Page
            }
          }.bind(this)
        });
      },

      _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
        MessageBox[sMessageBoxType](sMessage, {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.YES) {
              // debugger;
              this._wizard.discardProgress(this._wizard.getSteps()[0]);
             
              this.OnPressSave();
            }
          }.bind(this)
        });
      },
  
      handleNavBackToGeneral: function () {
        this._navBackToStep(this.byId("Step1"));
      },
  
      handleNavBackStep2: function () {
        this._navBackToStep(this.byId("Step2"));
      },
  
      handleNavBackStep3: function () {
        this._navBackToStep(this.byId("Step3"));
      },
  
      OnPressSave: function () {

        var _this = this;


        $.ajax({
          type: "GET",
          url: "/backend/v2/sourcing",
          headers: {
            "x-csrf-token": "Fetch",
          },
          success: function (data, textStatus, request) {
            var csrfToken = request.getResponseHeader("X-Csrf-Token");

            var fnSuccess = function (data) {
             
              debugger;
              var SRNumber = data.d.getNextNumber;
              var SupplierName = this.getView().getModel().getProperty("/SupplierRequest/SupplierName");
              var SupplierDBAName = this.getView().getModel().getProperty("/SupplierRequest/SDBAName");
              var SupplierStName = this.getView().getModel().getProperty("/SupplierRequest/SupplierStreet");
              var SuplierCity = this.getView().getModel().getProperty("/SupplierRequest/SupplierCity");
              var SupplierRegion = this.getView().getModel().getProperty("/SupplierRequest/SupplierRegion");

              var oSelectedCountry = this.getView().byId("country").getSelectedItem();
              if(oSelectedCountry) 
              {
                    var sCoutnryKey = oSelectedCountry.getKey();
                    var sCountryText = oSelectedCountry.getText();
              }

        
              var SupplierPostalCode = this.getView().getModel().getProperty("/SupplierRequest/SupplierPostalCode");
              var PrimaryContactFirstName = this.getView().getModel().getProperty("/SupplierRequest/PrimaryContactFirstName");
              var PrimaryContactLastName = this.getView().getModel().getProperty("/SupplierRequest/PrimaryContactLastName");
              var PrimaryContactNo = this.getView().getModel().getProperty("/SupplierRequest/PrimaryContactNo");
              var PrimaryContactEMail = this.getView().getModel().getProperty("/SupplierRequest/PrimaryContactEMail");

          
              var oCategoryInput = this.getView().byId("tmultiInput");
              var oRegionInput = this.getView().byId("tRegionMultiInput");

              var aCategoryTokens = oCategoryInput.getTokens();

              var sConcatenateCategories = "", sConcatenateRegions ="";

              for(var i=0; i < aCategoryTokens.length; i++)
              {
                var CategoryToken = aCategoryTokens[i];
                var sCategoryKey = CategoryToken.getKey();
                var sCategoryText = CategoryToken.getText();
                sConcatenateCategories += sCategoryKey + (i < aCategoryTokens.length - 1 ? ";" : "");
                
              }


              var aRegionTokens = oRegionInput.getTokens();

              for(var i=0; i < aRegionTokens.length; i++)
              {
                var RegionToken = aRegionTokens[i];
                var sRegionKey = RegionToken.getKey();
                var sRegionText = RegionToken.getText();
                sConcatenateRegions += sRegionKey + (i < aRegionTokens.length - 1 ? ";" : "");
              }

              var NDARadioButtonGroup = this.getView().byId("G001");
              var iNDASelectedIndex = NDARadioButtonGroup.getSelectedIndex();
              var aRadioButtons = NDARadioButtonGroup.getButtons();
              var oSelectedRadioButton = aRadioButtons[iNDASelectedIndex];
              var NDAValue = oSelectedRadioButton.getText();


              var DiligRadioButtonGroup = this.getView().byId("G002");
              var iDiligSelectedIndex = DiligRadioButtonGroup.getSelectedIndex();
              var aDiligRadioButtons = DiligRadioButtonGroup.getButtons();
              var oSelectedDiligRadioButton = aDiligRadioButtons[iDiligSelectedIndex];
              var DiligenceValue = oSelectedDiligRadioButton.getText();

              var oTextArea = this.getView().byId("comments");
              var Comments = oTextArea.getValue();

            
              var oDataModel = this.getOwnerComponent().getModel("SupplierMo");


              let myNDA = this.StringToBoolean(NDAValue);  
              let myDiligence = this.StringToBoolean(DiligenceValue);  

              // CALL ODATA TO CREATE AND THEN BLANK THE SCREEN..

            let SRNumberstr = SRNumber.toString();
            let paddedString = SRNumberstr.padStart(5,'0');
            let SRNumberfin = 'SR' + paddedString;

            var oSRRequest = {
              SuppRequestID: SRNumberfin,
              SupplierName: SupplierName,
              SDBAName: SupplierDBAName,
              SupplierStreet: SupplierStName,
              SupplierCity: SuplierCity,
              SupplierRegion: SupplierRegion,
              SupplierPostalCode: SupplierPostalCode,
              SupplierCountry: sCoutnryKey,
              PrimaryContactFirstName: PrimaryContactFirstName,
              PrimaryContactLastName: PrimaryContactLastName,
              PrimaryContactEMail: PrimaryContactEMail,
              PrimaryContactNo: PrimaryContactNo,
              NDA: myNDA,
              DueDiligence: myDiligence,
              Comments: Comments,
              Categories: sConcatenateCategories,
              Regions: sConcatenateRegions,
            };
         

            oDataModel.create("/SupplierRequest",oSRRequest, {
              success: (oData) => {

                debugger;
                // var Model = _this.getView().getModel().setData({});
                var oMultiInput1 = _this.getView().byId("multiInput");
                var oMultiInput2 = _this.getView().byId("RegionMultiInput");
                var oMultiInput3 = _this.getView().byId("tmultiInput");
                var oMultiInput4 = _this.getView().byId("tRegionMultiInput");
                oMultiInput1.removeAllTokens();
                oMultiInput2.removeAllTokens();
                oMultiInput3.removeAllTokens();
                oMultiInput4.removeAllTokens();
                var myRegionModel = _this.getView().getModel("regionmodel");
                myRegionModel.setProperty("/regiondata",[]);
                var myCategoryModel = _this.getView().getModel("categorymodel");
                myCategoryModel.setProperty("/categorydata",[]);
  
  
               _this.getView().byId("supplierdbaname").setValue("");
                _this.getView().byId("supplierstaddr").setValue("");
               _this.getView().byId("city").setValue("");
                _this.getView().byId("region").setValue("");
               _this.getView().byId("country").setSelectedKey("");
  
               _this.getView().byId("zipcode").setValue("");
               _this.getView().byId("cfname").setValue("");
               _this.getView().byId("clname").setValue("");
               _this.getView().byId("cphone").setValue("");
               _this.getView().byId("vsuppliername").setText("");
               _this.getView().byId("vsupplierdbaname").setText("");
               _this.getView().byId("vsupplierstaddr").setText("");
               _this.getView().byId("vcity").setText("");
               _this.getView().byId("vregion").setText("");
               _this.getView().byId("vcountry").setSelectedKey("");
               _this.getView().byId("vzipcode").setText("");
               _this.getView().byId("tfname").setText("");
               _this.getView().byId("tlname").setText("");
               _this.getView().byId("tphone").setText("");
               _this.getView().byId("temail").setText("");
               _this.getView().byId("tG001").setSelectedIndex(-1);
               _this.getView().byId("tG002").setSelectedIndex(-1);
               _this.getView().byId("G001").setSelectedIndex(-1);
               _this.getView().byId("G002").setSelectedIndex(-1);
               _this.getView().byId("ttextarea").setValue("");
               _this.getView().byId("comments").setValue("");
              
                _this.updateCreateStatus(SRNumber,"SR Created");

                _this.InitiateDocuSign(SRNumberfin);

                MessageBox.alert("Successfully Created SR Request", {
                  title: "Supplier Request Form",
                  onClose: function () {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(_this);
                    _this._navBackToStep(_this.byId("Step1"));
                    oRouter.navTo("home", {}, true /*no history*/);
                  }
                });

                // Create DocuSign.. For now initate without checking the validation switch..


              },
              error: (oError) => {
                console.log(oError, "oError");
                MessageToast.show("Error while creating Supplier Request");
              },
            });


             
      
       
       
            }.bind(_this); //Success of fetch Token

            var fnError = function (data) {
              console.log("Error in getNextNumber", data);

            }.bind(_this);

     debugger;
      var jdata = {
        requesttype : "SupplierRequest"
      };

        $.ajax({
          type: "POST",
          url: "/backend/v2/sourcing/getNextNumber",
          headers: {
            "X-Csrf-Token": csrfToken,
            "Content-Type": "application/json",
          },
          data: JSON.stringify(jdata),
          success: fnSuccess,
          error: fnError,
        });

      }, //end of ajax fetch token success
      
      error: function (data, request) {},
    });

       


      },

      InitiateDocuSign: function (SRID) {

        debugger;
        var jdata = {
          SRID : `${SRID}`,
          TemplateID: "e9fa0772-2737-49fa-b3e3-f5eeb69cd4c4"
        };
  
        var fnSuccess = function (data) {
          console.log("Initiated DocuSign Successfully");
        }.bind(this);
        
        var fnError = function (data) {
            console.log("Error in UpdateStatus");
        }.bind(this);

          $.ajax({
            type: "POST",
            url: "/backend/v2/sourcing/doCreateEnvelope",
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify(jdata),
            success: fnSuccess,
            error: fnError,
          });


      },

      updateCreateStatus: function (SRID,Status) {
       
        console.log("Supplier Request Created");

        var fnSuccess = function (data) {
          console.log("Status Updated");
        }.bind(this);
        
        var fnError = function (data) {
                  console.log("Error in UpdateStatus");
        
                }.bind(this);

        var jdata = {
          requesttype : "SupplierRequest",
          SRID: SRID.toString(),
          Status: Status
        };
  
          $.ajax({
            type: "POST",
            url: "/backend/v2/sourcing/doUpdateStatus",
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify(jdata),
            success: fnSuccess,
            error: fnError,
          });



      },

      checkSupplierData: function () {
        var supplierName = this.model.getProperty("/SupplierRequest/SupplierName") || "";
        if (supplierName.length < 10) {
          this._wizard.invalidateStep(this.byId("Step1"));
        } 
      },

    onLiveChange: function (oEvent) {

      if(oEvent.getParameter("keyCode") === 13) 
      {
        this.triggerBackendCheckDuplicate();
      }

      },

      // completedStep1Handler: function(oEvent)
      // {
      // },

      completedStep1Handler: function(oEvent)
      {

        debugger;
        this.getView().getModel().setProperty("/selectedNDAIndex",0);
        var bSelected = oEvent.getParameter("selected");
        var oTanC = this.getView().byId("agreeinfo");

        if (bSelected == true)
        {
    
        this.triggerBackendFinalCheckAddr().then(result => {

        if (result == undefined )
        {
         
          this._wizard.invalidateStep(this.byId("Step1"));
          oTanC.setSelected(false);
          MessageBox.error("Please fix the Address before proceeding to next section");
          return;
        }
        debugger;
        
        var AddrData = result.d.doSupplierAddressCheck;

        const respindicator = AddrData.substring(0, 2);
        const respmessage = AddrData.substring(2);

          if (respindicator == 'E:')
          {
           
            this._wizard.invalidateStep(this.byId("Step1"));
            oTanC.setSelected(false);
            MessageBox.error("Please fix the Address before proceeding to next section");

          }
          else
          {
           
            var parseAddrData = JSON.parse(AddrData);
            var oModel2 = new JSONModel(parseAddrData[0]);
            this.getView().setModel(oModel2,"NewAddressModel");

            //Get the Popup triggered.. 
            var Street = this.model.getProperty("/SupplierRequest/SupplierStreet") || "";
            var SupplierCity = this.model.getProperty("/SupplierRequest/SupplierCity") || "";
            var SupplierRegion = this.model.getProperty("/SupplierRequest/SupplierRegion") || "";
            var PostalCode = this.model.getProperty("/SupplierRequest/SupplierPostalCode") || "";
            var Country = this.model.getProperty("/SupplierRequest/SupplierCountry") || "";


            var jdata = {
              Street : Street,
              City : SupplierCity,
              State : SupplierRegion,
              zipCode : PostalCode
            };

            var oModel1 = new JSONModel(jdata);
            this.getView().setModel(oModel1,"OriginalAddressModel");

            // this.onSuccessMessageDialogPress(jdata,jdata);

            this._wizard.validateStep(this.byId("Step1"));
          }

          }).catch(error => {


          });
          
        } //checkbox selected
        else
        {
          //checkbox not selected
          oTanC.setSelected(false);
          this._wizard.invalidateStep(this.byId("Step1"));
        }

      },

      onLiveChangeAddress: function (oEvent) {

        if(oEvent.getParameter("keyCode") === 13) 
        {
          this.triggerBackendCheckAddr();
        }
  
        },

      onCancelPressPopupFlow: function (oEvent) {
        // Close the dialog fragment
        this.oProcessDialog.close();
      },

      onCancelPressPopupPostalFlow: function (oEvent) {
        // Close the dialog fragment
        this.oPostalDialog.close();
        this._wizard.validateStep(this.byId("Step1"));
        
      },

      triggerBackendCheckAddr:function()
      {
      
        var Street = this.model.getProperty("/SupplierRequest/SupplierStreet") || "";
        var SupplierCity = this.model.getProperty("/SupplierRequest/SupplierCity") || "";
        var SupplierRegion = this.model.getProperty("/SupplierRequest/SupplierRegion") || "";
        var PostalCode = this.model.getProperty("/SupplierRequest/SupplierPostalCode") || "";
        var Country = this.model.getProperty("/SupplierRequest/SupplierCountry") || "";
        
        debugger;
        var jdata = {
          Street : Street,
          City : SupplierCity,
          State : SupplierRegion,
          zipCode : PostalCode
        };
        var fnSuccess = function (data) {
          debugger;
          
        // var Data = JSON.stringify(data.d.doSupplierAddressCheck);
       
        /**** lets get the Supplier Data from Address Check API *****/

        //gram:set model

        var oModel1 = new JSONModel(jdata);

        this.getView().setModel(oModel1,"OriginalAddressModel");

        var AddrData = data.d.doSupplierAddressCheck;

        //gram:set model

        const respindicator = AddrData.substring(0, 2);
        const respmessage = AddrData.substring(2);

        if (respindicator == 'E:')
        {
          this.onErrorMessageDialogPress(respmessage);
          
        }
        else
        {
          // this.onSuccessMessageDialogPress(respmessage);
          var parseAddrData = JSON.parse(AddrData);
          var oModel2 = new JSONModel(parseAddrData[0]);
          this.getView().setModel(oModel2,"NewAddressModel");
          
          var oView = this.getView();
          var that = this;
          debugger;
          if (!this.oPostalDialog) {
            // Load the fragment asynchronously
            Fragment.load({
              id: oView.getId(),
              name: "com/sap/pgp/dev/SupplierControlApp/fragment/AddressPopup",
              controller: this
            }).then(function (oFragment) {
              that.oPostalDialog = oFragment;
              oView.addDependent(oFragment);
              oFragment.open();
            });
          } else {
            // Dialog fragment is already loaded, just open it
            this.oPostalDialog.open();
          }


        }

          }.bind(this);

          var fnError = function (data) {
          console.log("Error in getNextNumber", data);

        }.bind(this);

        $.ajax({
          type: "POST",
          url: "/backend/v2/sourcing/doSupplierAddressCheck",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(jdata),
          success: fnSuccess,
          error: fnError,
        });



      },

      triggerBackendFinalCheckAddr()
      {
      
        // return new Promise((resolve, reject) => {

        // });
        var Street = this.model.getProperty("/SupplierRequest/SupplierStreet") || "";
        var SupplierCity = this.model.getProperty("/SupplierRequest/SupplierCity") || "";
        var SupplierRegion = this.model.getProperty("/SupplierRequest/SupplierRegion") || "";
        var PostalCode = this.model.getProperty("/SupplierRequest/SupplierPostalCode") || "";
        var Country = this.model.getProperty("/SupplierRequest/SupplierCountry") || "";
        


        debugger;
        var jdata = {
          Street : Street,
          City : SupplierCity,
          State : SupplierRegion,
          zipCode : PostalCode
        };
  
        // var fnSuccess = function (data) {
        //   debugger;
          
        // // var Data = JSON.stringify(data.d.doSupplierAddressCheck);

        // var AddrData = data.d.doSupplierAddressCheck;
        

        // const respindicator = AddrData.substring(0, 2);
        // const respmessage = AddrData.substring(2);

        // if (respindicator == 'S:')
        // {
        //  return "Success";
        // }
        // else
        // {
        //   return respmessage;
        // }

        //   }.bind(this);

        //   var fnError = function (data) {
        //   console.log("Error in getNextNumber", data);

        // }.bind(this);

        try {

       return $.ajax({
          type: "POST",
          url: "/backend/v2/sourcing/doSupplierAddressCheck",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(jdata)        
        });

      }
      catch (error)
      {
        console.log("Error in addrcheck:",error);
        return Promise.reject(error);
      }

      },

      // onSuccessMessageDialogPress: function (message) {
      //   debugger;
      //   if (!this.oSuccessMessageDialog) {
      //     this.oSuccessMessageDialog = new Dialog({
      //       type: DialogType.Message,
      //       title: "Success",
      //       state: ValueState.Success,
      //       content: new Text({ text:message }),
      //       beginButton: new Button({
      //         type: ButtonType.Emphasized,
      //         text: "OK",
      //         press: function () {
      //           this.oSuccessMessageDialog.close();
      //         }.bind(this)
      //       })
      //     });
      //   }
  
      //   this.oSuccessMessageDialog.open();
      // },


      onSuccessMessageDialogPress: function (message) {
        debugger;

        var oView = this.getView();
        var that = this;
       
        if (!this.oPostalDialog) {
          // Load the fragment asynchronously
          Fragment.load({
            id: oView.getId(),
            name: "com/sap/pgp/dev/SupplierControlApp/fragment/AddressPopup",
            controller: this
          }).then(function (oFragment) {
            that.oPostalDialog = oFragment;
            oView.addDependent(oFragment);
            oFragment.open();
          });
        } else {
          // Dialog fragment is already loaded, just open it
          this.oPostalDialog.open();
        }

        // if (!this.oSuccessMessageDialog) {
        //   this.oSuccessMessageDialog = new Dialog({
        //     type: DialogType.Message,
        //     title: "Success",
        //     state: ValueState.Success,
        //     content: new Text({ text:message }),
        //     beginButton: new Button({
        //       type: ButtonType.Emphasized,
        //       text: "OK",
        //       press: function () {
        //         this.oSuccessMessageDialog.close();
        //       }.bind(this)
        //     })
        //   });
        // }
  
        // this.oSuccessMessageDialog.open();
      },


      onErrorMessageDialogPress: function (message) {

        if (!this.oErrorMessageDialog) {
          this.oErrorMessageDialog = new Dialog({
            type: DialogType.Message,
            title: "Error",
            state: ValueState.Error,
            content: new Text({ text: message }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: "OK",
              press: function () {
                this.oErrorMessageDialog.close();
              }.bind(this)
            })
          });
        }
  
        this.oErrorMessageDialog.open();
      },



      triggerBackendCheckDuplicate:function()
      {
      
        var Sname = this.model.getProperty("/SupplierRequest/SupplierName") || "";

        debugger;
        var jdata = {
          SupplierName : Sname
        };
  
        var fnSuccess = function (data) {
          debugger;
          
          // var Data = JSON.stringify(data.d.doSupplierNameCheckAriba);

          var SupplierData = JSON.parse(data.d.doSupplierNameCheckAriba);

          if ( SupplierData.length != 0 )
          {


          const ERPSupplierData = SupplierData.map(item => {
            let updatedSupplierName = item.SupplierID.startsWith('ACM') ? item.SupplierID.substring(4) : item.SupplierID;
            return {
              ...item,
              SupplierID: updatedSupplierName
            };
          });

          var oModel = new JSONModel(SupplierData);

          var oModelnew = new JSONModel(ERPSupplierData);


          this.getView().setModel(oModel,"SupplierDupModel");

          this.getView().setModel(oModelnew,"SupplierDupModelNew");



          var oView = this.getView();
          var that = this;
         
          if (!this.oProcessDialog) {
            // Load the fragment asynchronously
            Fragment.load({
              id: oView.getId(),
              name: "com/sap/pgp/dev/SupplierControlApp/fragment/NameCheckDialog",
              controller: this
            }).then(function (oFragment) {
              that.oProcessDialog = oFragment;
              oView.addDependent(oFragment);
              oFragment.open();
            });
          } else {
            // Dialog fragment is already loaded, just open it
            this.oProcessDialog.open();
          }

        } // if supplier found

          }.bind(this);

          var fnError = function (data) {
          console.log("Error in getNextNumber", data);

        }.bind(this);

        $.ajax({
          type: "POST",
          url: "/backend/v2/sourcing/doSupplierNameCheckAriba",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(jdata),
          success: fnSuccess,
          error: fnError,
        });

  



      },

      StringToBoolean: function(str){

        switch(str.toLowerCase().trim()) {
          case "true":
          case "yes":
          case "1":
              return true;
          case "false":
          case "no":
          case "0":
          case null:
              return false;
          default:
              return Boolean(string);
      }

      },
      incrementString: function(str){
          // Extract the non-numeric and numeric parts of the string
          const regexResult = str.match(/^([a-zA-Z]*)(\d+)$/);
          if (regexResult) {
              const textPart = regexResult[1];
              const numberPart = regexResult[2];

              // Increment the number
              const incrementedNumber = parseInt(numberPart, 10) + 1;

              // Convert the incremented number back to string with leading zeros
              const numberAsString = incrementedNumber.toString().padStart(numberPart.length, '0');

              // Return the concatenated result
              return textPart + numberAsString;
          } else {
              // Handle cases where the string does not end with numbers
              return str + '1'; // or some other appropriate handling
          }
          
      },

      handleNavBackToList: function () {
        this._navBackToStep(this.byId("Step1"));
      },

      onOpenPopoverDialog: function () {
        // create dialog lazily
        if (!this.oMPDialog) {
          this.oMPDialog = this.loadFragment({
            name: "com/sap/pgp/dev/SupplierControlApp/fragment/NameCheckDialog"
          });
        }
        this.oMPDialog.then(function (oDialog) {
          this.oDialog = oDialog;
          this.oDialog.open();
          // this._oMessageManager.registerObject(this.oView.byId("formContainer"), true);
  
          // MessageToast.show('Press "Save" to trigger validation.');
          // this.createMessagePopover();
        }.bind(this));
      },

      onExit: function() {
        // var oModel = this.getView().getModel();
        // oModel.setData({});
        // var suppliername = this.getView().byId("suppliername");
        // if (suppliername)
        // {
        //   suppliername.destroy();
        // }
      },
      _navBackToStep: function (step) {
        var fnAfterNavigate = function () {
          this._wizard.goToStep(step);
          this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
        }.bind(this);
  
        var myCategoryArrayx = this.getView().getModel("regionmodel");
        var myCategoryArray = myCategoryArrayx.getProperty("/regiondata");
        var oMultiInput1 = this.getView().byId("RegionMultiInput");
        oMultiInput1.setTokens(myCategoryArray);
 
       var myRegionArrayx = this.getView().getModel("categorymodel");
       var myRegionArray = myRegionArrayx.getProperty("/categorydata");
       var oMultiInput2 = this.getView().byId("multiInput");
       oMultiInput2.setTokens(myRegionArray);

        this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
        this._oNavContainer.to(this._oDynamicPage);
      }
    });
  });

