sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, MessageToast) {
	"use strict";

	return BaseController.extend("am.ZDASMGMT.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: false,
					delay: 0,
					EditMode: false
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.getRouter().getRoute("AddAssetDetails").attachPatternMatched(this._addAssetDetailsMatched, this);
			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			oViewModel.setProperty("/delay", iOriginalBusyDelay);

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onPressFile: function (oEvent) {
			this.getView().setBusy(true);
			if (!this._oFrag) {
				this._oFrag = sap.ui.xmlfragment(this.createId("idAssestPreview"), "am.ZDASMGMT.fragments.FilePreview",
					this);
				this._fnGetAssestContent();
				this.getView().addDependent(this._oFrag);
			}
			this.getView().setBusy(false);
			this._oFrag.open();
		},
		/**
		 * event handler for dialog close
		 */
		onDialogClose: function () {
			this._oFrag.close();
		},

		/**
		 * event handle for Cancel button on footer
		 */
		onCancelButtonPress: function () {
			this.getRouter().navTo("worklist");
		},
		/**
		 * event handle for Approve button on footer
		 */
		onApproveBtnPress: function () {
			var sPathStatusKey = "/" + this.objectId + "/ProductionStatusKey";
			var sPathStatusText = "/" + this.objectId + "/ProductionStatusTxt";
			this.getOwnerComponent().getModel("MockData").setProperty(sPathStatusText, "Done");
			this.getOwnerComponent().getModel("MockData").setProperty(sPathStatusKey, "02");
			var sMessage = this.getResourceBundle().getText("MSG_APPROVE_SUCCESS");
			MessageToast.show(sMessage);
			var that = this;
			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", true);
			setTimeout(function () {
				oViewModel.setProperty("/busy", false);
				that.getRouter().navTo("worklistUpdate");
			}, 1000);

		},
		/**
		 * event handle for Create button on footer
		 */
		onCreateBtnPress: function () {
			var oAssetData = this.getView().getModel("AssetModel").getData();
			oAssetData.AssetID = "AIDXXXXX";
			var oMockData = this.getOwnerComponent().getModel("MockData").getData();
			oMockData.push(oAssetData);
			this.getOwnerComponent().getModel("MockData").setData(oMockData);
			var sMessage = this.getResourceBundle().getText("MSG_CREATE_SUCCESS");
			MessageToast.show(sMessage);
			var that = this;
			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", true);
			setTimeout(function () {
				oViewModel.setProperty("/busy", false);
				that.getRouter().navTo("worklistUpdate");
			}, 1000);

		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("MockData");
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.objectId = sObjectId;
			var oAssetData = oModel.getData()[sObjectId];
			var oItemModel = new JSONModel(oAssetData);
			this.getView().setModel(oItemModel);
			this.getView().getModel("objectView").setProperty("/EditMode", false);
			if (this._oFrag) {
				this._oFrag.close(this);
				this._oFrag.destroy();
				delete this._oFrag;
			}
		},
		/**
		 * function to handle pattern match for Creating new asset
		 */
		_addAssetDetailsMatched: function () {
			this.getView().getModel("objectView").setProperty("/EditMode", true);
			this.setNewAssetModel();
		},
		/**
		 * function to set model for asset creation
		 */
		setNewAssetModel: function () {
			var oData = {
				FieldName: "",
				AssetID: "",
				AssetPortalLink: "",
				AssetName: "",
				ProductionStatusTxt: "Confidential",
				ProductionStatusKey: "01",
				Description: "",
				ReadyDate: new Date(),
				AssetTypeId: "",
				AssetTypeName: "",
				Theme: "",
				SKU: "",
				Campaign: "",
				Audience: "",
				SubAudience: "",
				Market: "",
				ContentManager: ""
			};
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel, "AssetModel");
		},
		/**
		 * function to get asset file content
		 */
		_fnGetAssestContent: function () {
			var oControl = null;
			var oAsset = this.getView().getModel().getData().AssetTypeId;
			var oViewer = sap.ui.core.Fragment.byId(this.createId("idAssestPreview"), 'viewer');
			if (oAsset === "01") {
				//handle image display
				oControl = new sap.ui.vk.ContentResource({
					// specifying the resource to load
					source: "../localRepository/Poster.jpeg",
					sourceType: "jpg",
					sourceId: "vkIdImage"
				});
				oViewer.addContentResource(oControl);
			} else if (oAsset === "02") {
				// handle video rendering
				oViewer.setVisible(false);
				oControl = new sap.ui.core.HTML("html1", {
					content: "<video width='600' controls autoplay>" +
						"<source src='../localRepository/SampleVideo.mp4' type='video/mp4'>" +
						"Your browser does not support the video tag." +
						"</video>"
				});
				sap.ui.core.Fragment.byId(this.createId("idAssestPreview"), 'idDialog').addContent(oControl);
			} else if (oAsset === "03") {
				//handle 3D file rendering
				oControl = new sap.ui.vk.ContentResource({
					// specifying the resource to load
					source: "../localRepository/cylinderTestModel.vds",
					sourceType: "vds",
					sourceId: "vkId3DFile"
				});
				oViewer.addContentResource(oControl);
			}
			return oControl;
		}

	});

});