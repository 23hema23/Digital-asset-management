sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
			statusFormatter: function (sStatus) {
			//status formatter
			// Formatting method to set the right status of the list items          
			switch (sStatus) {
			case "01":
				return sap.ui.core.ValueState.Warning;
			case "02":
					return sap.ui.core.ValueState.Success;
			default: //fallback (should not happen)
				return sap.ui.core.ValueState.None;
			}

		}

	};

});