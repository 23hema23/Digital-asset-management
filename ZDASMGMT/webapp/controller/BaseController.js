sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, UIComponent, mobileLibrary, Filter, FilterOperator) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("am.ZDASMGMT.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		/**
		 * function to get filter array 
		 */
		_fnGetFiltersArray: function (sFragId, sFilterBarId) {
			var aFilterItms = sap.ui.core.Fragment.byId(this.createId(sFragId), sFilterBarId).getAllFilterItems(
				true);
			var aFiltersParams = this._fnGetFilters(aFilterItms);
			var aFilters = [];
			var aPaths = Object.getOwnPropertyNames(aFiltersParams);
			aPaths.forEach(function (ele) {
				aFilters.push(aFiltersParams[ele]);
			});
			return aFilters;
		},
		/**
		 * function to get filters with value 
		 */
		_fnGetFilters: function (aFilterItms) {
			var aFilterParams = {};
			var key;
			var aFilters, oFilter;
			var that = this;
			aFilterItms.forEach(function (element) {
				if (element.getVisibleInFilterBar()) {
					var oCtrl = element.getControl();
					if (oCtrl.getMetadata().getElementName().search("MultiComboBox") !== -1) {
						var aKeys = oCtrl.getSelectedKeys();
						aFilters = [];
						for (key in aKeys) {
							aFilters.push(new Filter(element.getName(), FilterOperator.Contains, aKeys[key]));
						}
						if (aFilters.length > 0) {
							oFilter = new Filter({
								filters: aFilters,
								and: false
							});
							aFilterParams[element.getName()] = oFilter;
						}
					} else
					if (oCtrl.getMetadata().getElementName().search("Input") !== -1) {
						if (element.getName().indexOf(",") !== -1 && oCtrl.getValue() !== "") {
							var aProperties = element.getName().split(",");
							aFilters = [];
							for (var prop in aProperties) {
								aFilters.push(new Filter(aProperties[prop], FilterOperator.Contains, oCtrl.getValue()));
							}
							if (aFilters.length > 0) {
								oFilter = new Filter({
									filters: aFilters,
									and: false
								});
								aFilterParams[element.getName()] = oFilter;
							}
						} else if (oCtrl.getValue() !== "") {
							aFilterParams[element.getName()] = new Filter(element.getName(), FilterOperator.Contains, oCtrl.getValue());
						}
					}
				}
			});
			return aFilterParams;
		},
		/**
		 * function to apply filters on table
		 */
		fnUpdateTable: function (oTable, aFilters) {
			if (aFilters.length > 0) {
				oTable.getBinding("items").filter([aFilters]);
			} else {
				oTable.getBinding("items").filter(null);
			}
		},
		/**
		 * function to clear filters
		 */
		fnClearFilter: function (oTable) {
			oTable.getBinding("items").filter(null);
		},
		/**
		 * function to restore table data 
		 */
		_fnRestoreTableData: function (oTable, oFilterBar) {
			var that = this;
			oTable.getBinding("items").filter(null);
			var aFilterItms = oFilterBar.getAllFilterItems(true);
			that._fnResetFilters(aFilterItms);
		},

		/**
		 * function to reset filters
		 */
		_fnResetFilters: function (aFilterItms) {
			aFilterItms.forEach(function (element) {
				var oCtrl = element.getControl();
				if (oCtrl.getMetadata().getElementName().search("MultiComboBox") !== -1) {
					oCtrl.setSelectedItems(null);
				} else {
					oCtrl.setValue("");
				}
			});
		},

		/**
		 * Adds a history entry in the FLP page history
		 * @public
		 * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		 * @param {boolean} bReset If true resets the history before the new entry is added
		 */
		addHistoryEntry: (function () {
			var aHistoryEntries = [];

			return function (oEntry, bReset) {
				if (bReset) {
					aHistoryEntries = [];
				}

				var bInHistory = aHistoryEntries.some(function (oHistoryEntry) {
					return oHistoryEntry.intent === oEntry.intent;
				});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
						oService.setHierarchy(aHistoryEntries);
					});
				}
			};
		})()

	});

});