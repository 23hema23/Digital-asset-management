sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("am.ZDASMGMT.controller.App", {
		/**
		 * onInit : life cycle method initialization
		 */
		onInit: function () {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function () {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// disable busy indication when the metadata is loaded and in case of errors
			this.getOwnerComponent().getModel().metadataLoaded().
			then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this._setInitialRole();
		},

		/**
		 * Event handler : on open role options
		 */
		handleChangeRole: function (oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("am.ZDASMGMT.fragments.ChangeRole", this);
				this.getView().addDependent(this._oPopover);
			}
			if (!this._oPopover.isOpen()) {
				var oButton = oEvent.getSource();
				jQuery.sap.delayedCall(0, this, function () {
					this._oPopover.openBy(oButton);
				});
			} else {
				this._oPopover.close();
			}
		},
		/**
		 * Event handler : on role selection
		 */
		handleRoleClick: function (oEvent) {
			var oModel = new JSONModel();
			var oData = {};
			var obj = oEvent.getSource().getProperty("title");
			switch (obj) {
			case "Content Manager":
				oData.role = "CM";
				oData.roleTxt = "Content Manager";
				break;
			case "Product Group Manager":
				oData.role = "PGM";
				oData.roleTxt = "Product Group Manager";
				break;
			case "Local Market Manager":
				oData.role = "LMM";
				oData.roleTxt = "Local Market Manager";
				break;
			}
			oModel.setData(oData);
			this.getOwnerComponent().setModel(oModel, "roleModel");
		},
		/**
		 * Inernal method to set initial role as content manager
		 */
		_setInitialRole: function () {
			var oData = {};
			oData.role = "CM";
			oData.roleTxt = "Content Manager";
			var oModel = new JSONModel(oData);
			this.getOwnerComponent().setModel(oModel, "roleModel");
		}

	});

});