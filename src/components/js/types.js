/**
 * @typedef {Function} ModalOkCallback
 * @param {Object} sender
 */
/**
 * @typedef {Function} TemplateCallback
 * @param {Object} dataItem
 * @returns {string}
 */

/**
 * @typedef {Function} ModalEditorDisabledCallback
 * @param {Object} dataItem - Receives the editing dataitem.
 * @returns {boolean} - Boolean which indiacates whether the field will be disabled or not
 * 
 */

/**
 * @typedef ModalEditor
 * @type {object}
 * @property {boolean} editable - Set the fields editable
 * @property {string} type - Field type: 'input' or 'dropdown'.
 * @property {number} position - Position of the field in the Modal starting from the top left.
 * @property {ModalEditorDisabledCallback} disabled - Sets the field disabled depending on the callback's returning.
 * @property {Array} source - Array which will fill the dropdown given the case.
 * @property {string} textField - Property name from the source to display the text in the dropdown.
 * @property {string} valueField - Property name from the source to take the value from the dropdown.
 */

/**
 * @typedef ModalColumns
 * @type {object}
 * @property {string} field - Property name
 * @property {string} title - Label for the field'.
 * @property {string} type - Data type.
 * @property {ModalEditor} editor - Editor configuration.
 */

/**
 * @typedef ModalFooterConfig
 * @type {object}
 * @property {string} direction - Column is the default mode, but if you wanted to make it row, just type 'row'
 */


/**
 * @typedef ModalOptions
 * @type {object}
 * @property {ModalColumns[]} columns - Modal columns/fields.
 * @property {string} title - Title of the Modal.
 * @property {string} bodyTemplate - Title of the Modal.
 * @property {string} mode - Specifies the Modal mode. Type 'crud' if you are building a CRUD (you will need to specify the 'action' property).
 * @property {string} action - In case you use the modal for a CRUD, you can specify whether you want to edit, add or remove an item (each option has a different behaviour internally, so make sure it's either one of the available options or empty.).
 * @property {string} primaryColor - This color will be applied on buttons, and titles.
 * @property {string} deleteTitleItemField - Sets the property to get the value of the DataItem to delete, to show in the title of the Modal. Example: Are you sure you want to delete 'SOMETHING' ?.
 * @property {ModalOkCallback} okCallback - The callback to execute when the user "confirms" the action. Parameter: object containing a callback to close the modal and the dataitem in case you are using the CRUD mode..
 * @property {ModalFooterConfig} footer - Sets footer configuration such as styling
 */