sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Sorter) {
	"use strict";

	return BaseController.extend("am.ZDASMGMT.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._fnSetMockData();
			var oTemp = this.byId("AMColumnListItem");
			var btempSharable = true;
			var oSorter = new Sorter({
				path: "ReadyDate",
				descending: true,
				group: true
			});
			oTable.bindItems({
				path: "/",
				template: oTemp,
				sorter: oSorter,
				templateShareable: btempSharable
			});

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#DigitalAssetManagement-display"
			}, true);
			this.getRouter().getRoute("worklistUpdate").attachPatternMatched(this._onWorklistUpdateMatched, this);
		},

		/**
		 * onExit lifecycle method handling
		 */
		onExit: function () {
			var oTemp = this.byId("AMColumnListItem");
			oTemp.destroy();
			oTemp = undefined;
		},

		/**
		 * Function to set mock data
		 */
		_fnSetMockData: function () {
			var oModel = this.getOwnerComponent().getModel("MockData");
			var oData = oModel.getData();
			for (var key in oData) {
				var parts = oData[key].ReadyDate.split('.');
				oData[key].ReadyDate = new Date(parts[2], parts[1] - 1, parts[0]);
			}
			oModel.setData(oData);
			this.getView().setModel(oModel);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler when filter bar go button is pressed
		 * @public
		 */
		onWorklistFilterApply: function () {
			// var that = this;
			var oFilterBar = this._fnGetFiltersArray("frgWorklistFilters", "fbWorklistFilters");
			var oTable = this.byId("table");
			this.fnUpdateTable(oTable, oFilterBar);
		},

		/**
		 * Event handler when filter bar clear button is pressed
		 * @public
		 */
		onPressWorklistFilterRestore: function () {
			var oFilterBar = this._fnGetFiltersArray("frgWorklistFilters", "fbWorklistFilters");
			var oTable = this.byId("table");
			this._fnRestoreTableData(oTable, oFilterBar);
		},

		/**
		 * navigate to add asset details page
		 */
		onAddAssetDetails: function () {
			this.getRouter().navTo("AddAssetDetails", true);
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 */
		_showObject: function (oItem) {
			var sPath = oItem.getBindingContextPath();
			var start = sPath.indexOf("/");
			var index = sPath.substring(start + 1);
			this.getRouter().navTo("object", {
				objectId: index
			});
		},

		/**
		 * Handle worklist refresh for update or create scenarios
		 */
		_onWorklistUpdateMatched: function () {
				this._fnSetMockData();
		}

	});
});