// messaging_protocol.js
export {
  RECIPIENT_BACKGROUND,
  BACKGROUND_GET_MAPPINGS,
  BACKGROUND_SAVE_MAPPINGS,
  BACKGROUND_ADD_MAPPING,
  BACKGROUND_EDIT_MAPPING,
  BACKGROUND_DELETE_MAPPING,
  BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE,
  BACKGROUND_GET_CONSOLIDATED_MAPPING,
  BACKGROUND_GET_SETTINGS,
  BACKGROUND_SAVE_SETTINGS,
  BACKGROUND_SAVE_STATE,
  RECIPIENT_CONTENT,
  CONTENT_ANNOTATE,
  CONTENT_REMOVE_ANNOTATIONS
};


// BACKGROUND_SCRIPT_MESSAGES
const RECIPIENT_BACKGROUND = "RECIPIENT_BACKGROUND";

/**
 * #### DESCRIPTION:
 * The background script listens to `BACKGROUND_GET_MAPPINGS` messages to
 * retrieve mappings from storage and send them back.
 * #### PAYLOAD:
 * ##### None
 * #### RESPONSE:
 * An array of mappings.
 * ##### EXAMPLE:
 *     [
 *       {
 *         "mapping_name": "First Example Mapping",
 *         "description": "has one set of keys and annotations",
 *         "mapping": {
 *           "key_1": "annotation_1",
 *           "key_2": "annotation_2"
 *         }
 *         "selected": true
 *       },
 *       {
 *         "mapping_name": "Second Example Mapping",
 *         "description": "has another set of keys and annotations",
 *         "mapping": {
 *           "key_1": "annotation_4",
 *           "key_3": "annotation_3"
 *         },
 *         "selected": true
 *       },
 *       {
 *         "mapping_name": "Third Example Mapping",
 *         "description": "has yet another set of keys and annotations",
 *         "mapping": {
 *           "key_4": "annotation_4",
 *           "key_5": "annotation_5"
 *         },
 *         "selected": false
 *       }
 *     ]
 */
const BACKGROUND_GET_MAPPINGS = "BACKGROUND_GET_MAPPINGS";

/**
 * #### DESCRIPTION:
 * The background script listens to `BACKGROUND_SAVE_MAPPINGS` messages to
 * overwrite the `MAPPINGS` object in storage with `MAPPINGS_TO_SAVE` in the
 * payload.
 * #### PAYLOAD:
 * ##### `MAPPINGS_TO_SAVE`
 * An array of mappings objects.
 * ##### EXAMPLE:
 *     {
 *       `MAPPINGS_TO_SAVE`: [
 *         {
 *           "mapping_name": "First Example Mapping",
 *           "description": "has one set of keys and annotations",
 *           "mapping": {
 *             "key_1": "annotation_1",
 *             "key_2": "annotation_2"
 *           }
 *           "selected": true
 *         },
 *         {
 *           "mapping_name": "Second Example Mapping",
 *           "description": "has another set of keys and annotations",
 *           "mapping": {
 *             "key_1": "annotation_4",
 *             "key_3": "annotation_3"
 *           },
 *           "selected": true
 *         },
 *         {
 *           "mapping_name": "Third Example Mapping",
 *           "description": "has yet another set of keys and annotations",
 *           "mapping": {
 *             "key_4": "annotation_4",
 *             "key_5": "annotation_5"
 *           },
 *           "selected": false
 *         }
 *       ]
 *     }
 * #### RESPONSE:
 * A Promise indicating whether save was successful.
 */
const BACKGROUND_SAVE_MAPPINGS = "BACKGROUND_SAVE_MAPPINGS";

/**
 * #### DESCRIPTION:
 * The background script listens to `BACKGROUND_ADD_MAPPING` messages to
 * add a new mapping to `MAPPINGS` in the database.
 * #### PAYLOAD:
 * ##### `NEW_MAPPING`
 * A new mapping (see database.js for mapping object typdef)
 * ##### EXAMPLE:
 *     {
 *       `NEW_MAPPING`: {
 *         "mapping_name": "New Example Mapping",
 *         "description": "has a set of keys and annotations",
 *         "mapping": {
 *           "key_1": "annotation_1",
 *           "key_2": "annotation_2"
 *         }
 *         "selected": true
 *       }
 *     }
 * #### RESPONSE:
 * A Promise indicating whether the new mapping's creation was successful.
 */
const BACKGROUND_ADD_MAPPING = "BACKGROUND_ADD_MAPPING";

/**
 * #### DESCRIPTION:
 * The background script listens to `BACKGROUND_EDIT_MAPPING` messages to
 * overwrite the mapping with `MAPPING_NAME` in `MAPPINGS` in the database with
 * the edited version `EDITED_MAPPING`.
 * #### PAYLOAD:
 * ##### `MAPPING_NAME`
 * A string containing the name of the mapping to be overwritten. Should match
 * the `mapping_name` in `EDITED_MAPPING`.
 * ##### `EDITED_MAPPING`
 * A mapping object (see database.js for mapping objects' typedef) that should
 * have `MAPPING_NAME` as its `mapping_name`.
 * ##### EXAMPLE:
 *     {
 *       `MAPPING_NAME`: "Example Mapping to be edited",
 *       `EDITED_MAPPING`: {
 *         "mapping_name": "Example Mapping to be edited",
 *         "description": "has one set of keys and annotations",
 *         "mapping": {
 *           "key_1": "annotation edited",
 *           "edited_key": "annotation also changed by edit",
 *           "added_key": "added by edit"
 *         }
 *         "selected": true
 *       }
 *     }
 * #### RESPONSE:
 * A Promise indicating whether the edit was successful. Possible errors
 * include no mapping being found with the given `MAPPING_NAME`.
 */
const BACKGROUND_EDIT_MAPPING = "BACKGROUND_EDIT_MAPPING";

/**
 * #### DESCRIPTION:
 * The background script listens to `BACKGROUND_DELETE_MAPPING`
 * messages to delete a mapping from the database whose `mapping_name` matches
 * the supplied string `MAPPING_NAME`.
 * #### PAYLOAD:
 * ##### `MAPPING_NAME`
 * A string with the name of the mapping to be removed from the database.
 * ##### EXAMPLE:
 *     {
 *       `MAPPING_NAME`: "Example mapping to be removed"
 *     }
 * #### RESPONSE:
 * A Promise indicating whether operation was successful. Possible errors
 * include no mapping being found with the given `MAPPING_NAME`.
 */
const BACKGROUND_DELETE_MAPPING = "BACKGROUND_DELETE_MAPPING";

/**
 * #### DESCRIPTION:
 * The background script listens to `BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE`
 * messages to reorder and update selections in a supplied list of mappings
 * (`MAPPINGS_TO_UPDATE_PRIORITY`) to match a supplied update object
 * (`MAPPINGS_PRIORITY_UPDATE_OBJECT`).
 * #### PAYLOAD:
 * ##### `MAPPINGS_PRIORITY_UPDATE_OBJECT`
 * An array of objects with `name` and `selected` to represent order and the
 * selection status of a set mappings which should match
 * `MAPPINGS_PRIORITY_UPDATE_OBJECT` in number and names.
 * ##### `MAPPINGS_TO_UPDATE_PRIORITY`
 * A set of mappings (see database.js for mappings object typedef) that should
 * match the `MAPPINGS_PRIORITY_UPDATE_OBJECT` in number and names.
 * ##### EXAMPLE:
 *     {
 *       "MAPPINGS_PRIORITY_UPDATE_OBJECT" : [
 *         {"name": "Third Example Mapping",  "selected": 'false'},
 *         {"name": "First Example Mapping",  "selected": 'true'},
 *         {"name": "Second Example Mapping", "selected": 'false'}
 *       ],
 *       "MAPPINGS_TO_UPDATE_PRIORITY": [
 *         {
 *           "mapping_name": "First Example Mapping",
 *           "description": "has one set of keys and annotations",
 *           "mapping": {
 *             "key_1": "annotation_1",
 *             "key_2": "annotation_2"
 *           }
 *           "selected": true
 *         },
 *         {
 *           "mapping_name": "Second Example Mapping",
 *           "description": "has another set of keys and annotations",
 *           "mapping": {
 *             "key_1": "annotation_4",
 *             "key_3": "annotation_3"
 *           },
 *           "selected": true
 *         },
 *         {
 *           "mapping_name": "Third Example Mapping",
 *           "description": "has yet another set of keys and annotations",
 *           "mapping": {
 *             "key_4": "annotation_4",
 *             "key_5": "annotation_5"
 *           },
 *           "selected": false
 *         }
 *       ]
 *     }
 * #### RESPONSE:
 * An array of mapping objects matching the order and selections given in
 * `MAPPINGS_PRIORITY_UPDATE_OBJECT`
 * ##### EXAMPLE:
 *     [
 *       {
 *         "mapping_name": "Third Example Mapping",
 *         "description": "has yet another set of keys and annotations",
 *         "mapping": {
 *           "key_4": "annotation_4",
 *           "key_5": "annotation_5"
 *         },
 *         "selected": false
 *       },
 *       {
 *         "mapping_name": "First Example Mapping",
 *         "description": "has one set of keys and annotations",
 *         "mapping": {
 *           "key_1": "annotation_1",
 *           "key_2": "annotation_2"
 *         }
 *         "selected": true
 *       },
 *       {
 *         "mapping_name": "Second Example Mapping",
 *         "description": "has another set of keys and annotations",
 *         "mapping": {
 *           "key_1": "annotation_4",
 *           "key_3": "annotation_3"
 *         },
 *         "selected": false
 *       }
 *     ]
 */
const BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE = "BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE";

/**
 * #### DESCRIPTION:
 * The background script listens to `BACKGROUND_GET_CONSOLIDATED_MAPPING`
 * messages to send back a single mapping with only mappings (i.e. keys and
 * corresponding annotations) from the payload's `MAPPINGS_TO_CONSOLIDATE`.
 * #### PAYLOAD:
 * ##### `MAPPINGS_TO_CONSOLIDATE`
 * An array of mappings objects.
 * ##### EXAMPLE:
 *     {
 *       "MAPPINGS_TO_CONSOLIDATE" : [
 *         {
 *           "mapping_name": "First Example Mapping",
 *           "description": "has one set of keys and annotations",
 *           "mapping": {
 *             "key_1": "annotation_1",
 *             "key_2": "annotation_2"
 *           }
 *           "selected": true
 *         },
 *         {
 *           "mapping_name": "Second Example Mapping",
 *           "description": "has another set of keys and annotations",
 *           "mapping": {
 *             "key_1": "annotation_4",
 *             "key_3": "annotation_3"
 *           },
 *           "selected": true
 *         },
 *         {
 *           "mapping_name": "Third Example Mapping",
 *           "description": "has yet another set of keys and annotations",
 *           "mapping": {
 *             "key_4": "annotation_4",
 *             "key_5": "annotation_5"
 *           },
 *           "selected": false
 *         }
 *       ]
 *     }
 * #### RESPONSE:
 * A `consolidated_mapping`, a single object with keys and corresponding annotations.
 * The `consolidated_mapping` has every key from every mapping in the payload array.
 *
 * Overlapping keys between the mappings will have the same annotation as they did in
 * whichever mapping they appeared in with the highest priority (i.e. whichever
 * mapping appeared earliest in the payload array).
 * ##### EXAMPLE:
 *     {
 *       // `key_1` is mapped to `annotation_4` rather than `annotation_1` in the
 *       // consolidated mapping because 'First Example Mapping' appeared before
 *       // 'Second Example Mapping' and thus had a higher priority
 *       "key_1": "annotation_1",
 *       "key_2": "annotation_2",
 *       "key_3": "annotation_3"
 *     }
 */
const BACKGROUND_GET_CONSOLIDATED_MAPPING = "BACKGROUND_GET_CONSOLIDATED_MAPPING";

/**
 * #### DESCRIPTION:
 * The background script listens to `BACKGROUND_GET_SETTINGS` messages to
 * retrieve settings from storage and send them back.
 * #### PAYLOAD:
 * ##### None
 * #### RESPONSE:
 * A settings object (see database.js for a settings object's typedef).
 * ##### EXAMPLE:
 *     {
 *       "AUTOSAVE": true,
 *       "EXAMPLE_OPTION_1": false,
 *       "EXAMPLE_OPTION_2": true
 *     }
 */
const BACKGROUND_GET_SETTINGS = "BACKGROUND_GET_SETTINGS";

/**
 * #### DESCRIPTION:
 * The background script listens to `BACKGROUND_SAVE_SETTINGS` messages to
 * overwrite the `SETTINGS` object in storage with the payload's `SETTINGS_TO_SAVE`.
 * #### PAYLOAD:
 * ##### `SETTINGS_TO_SAVE`
 * A settings object.
 * ##### EXAMPLE:
 *     {
 *       `SETTINGS_TO_SAVE`: {
 *         "AUTOSAVE": true,
 *         "EXAMPLE_OPTION_1": false,
 *         "EXAMPLE_OPTION_2": true
 *       }
 *     }
 * 
 * #### RESPONSE:
 * A Promise indicating whether save was successful
 */
const BACKGROUND_SAVE_SETTINGS = "BACKGROUND_SAVE_SETTINGS";

/**
 * #### DESCRIPTION:
 * The background script listens to `BACKGROUND_SAVE_STATE` messages to overwrite
 * the `MAPPINGS_TO_SAVE` array and the `SETTINGS_TO_SAVE` object in storage with
 * `MAPPINGS_TO_SAVE` and `SETTINGS_TO_SAVE` from the payload respectively.
 * #### PAYLOAD:
 * ##### `MAPPINGS_TO_SAVE`
 * An array of mappings objects.
 * ##### `SETTINGS_TO_SAVE`
 * A settings object.
 * ##### EXAMPLE:
 *     {
 *       'MAPPINGS_TO_SAVE' : [
 *         {
 *           "mapping_name": "First Example Mapping",
 *           "description": "has one set of keys and annotations",
 *           "mapping": {
 *             "key_1": "annotation_1",
 *             "key_2": "annotation_2"
 *           }
 *           "selected": true
 *         },
 *         {
 *           "mapping_name": "Second Example Mapping",
 *           "description": "has another set of keys and annotations",
 *           "mapping": {
 *             "key_1": "annotation_4",
 *             "key_3": "annotation_3"
 *           },
 *           "selected": true
 *         },
 *         {
 *           "mapping_name": "Third Example Mapping",
 *           "description": "has yet another set of keys and annotations",
 *           "mapping": {
 *             "key_4": "annotation_4",
 *             "key_5": "annotation_5"
 *           },
 *           "selected": false
 *         }
 *       ]
 *       'SETTINGS_TO_SAVE' : {
 *         "AUTOSAVE": true,
 *         "EXAMPLE_OPTION_1": false,
 *         "EXAMPLE_OPTION_2": true
 *       }
 *     }
 * #### RESPONSE:
 * A Promise indicating whether save was successful.
 */
const BACKGROUND_SAVE_STATE = "BACKGROUND_SAVE_STATE";

// CONTENT_SCRIPT_MESSAGES
const RECIPIENT_CONTENT = "RECIPIENT_CONTENT";

/**
 * #### DESCRIPTION:
 * The content script listens to `CONTENT_ANNOTATE` messages to perform an
 * annotation of each key found in the text of the current tab based on the
 * payload's `MAPPINGS`.
 * #### PAYLOAD:
 * ##### `MAPPINGS`
 * An array of every mapping (see database.js for specifics) to be applied.
 * The order of the mappings determines which annotation will be used for keys
 * repeated in multiple mappings.
 * ##### EXAMPLE:
 *     {
 *       'MAPPINGS': [
 *         {
 *           "mapping_name": "First Example Mapping",
 *           "description": "has one set of keys and annotations",
 *           "mapping": {
 *             "key_1": "annotation_1",
 *             "key_2": "annotation_2"
 *           }
 *           "selected": true
 *         },
 *         {
 *           "mapping_name": "Second Example Mapping",
 *           "description": "has another set of keys and annotations",
 *           "mapping": {
 *             "key_1": "annotation_4",
 *             "key_3": "annotation_3"
 *           },
 *           "selected": true
 *         },
 *         {
 *           "mapping_name": "Third Example Mapping",
 *           "description": "has yet another set of keys and annotations",
 *           "mapping": {
 *             "key_4": "annotation_4",
 *             "key_5": "annotation_5"
 *           },
 *           "selected": false
 *         }
 *       ]
 *     }
 * #### RESPONSE:
 * A Promise indicating whether the annotation operation was successful.
 */
const CONTENT_ANNOTATE = "CONTENT_ANNOTATE";

/**
 * #### DESCRIPTION:
 * The content script listens to `CONTENT_REMOVE_ANNOTATION` messages to remove
 * the annotation of the text in the current tab matching each key in the
 * payload's `MAPPINGS`.
 * `MAPPINGS`.
 * #### PAYLOAD:
 * None (don't send anything).
 * #### RESPONSE:
 * A Promise representing the success or failure of the annotation removal
 * operation.
 */
const CONTENT_REMOVE_ANNOTATIONS = "CONTENT_REMOVE_ANNOTATIONS";