/*** test applyMappingsPriorityUpdates() */
import {
	applyMappingsPriorityUpdates
} from "../background_mapping_handler.js";

import {
	DEFAULT_MAPPINGS
} from "../database.js";

const ERROR_MSG = "expected and actual don't match";

let all_mappings = [...DEFAULT_MAPPINGS];
let all_mappings_after = [...all_mappings];
let mappings_update_object = all_mappings.map((mapping) =>
	({"name": mapping.mapping_name, "selected": mapping.selected})
);

/* -- begin normal function test -- */

// initialize test var
let normal_priority_update_test = {
	test_name: "normal operation test",
	modified_mappings_object: mappings_update_object,
	mappings_to_update: all_mappings,
	expected: {},
	actual: {},
	result: {}
};

/* change priority in mappings update object */
/* swap index 1 and 3 */
[
	normal_priority_update_test.modified_mappings_object[3],
	normal_priority_update_test.modified_mappings_object[1]
] = [
	normal_priority_update_test.modified_mappings_object[1],
	normal_priority_update_test.modified_mappings_object[3]
];
/* it's a destructuring assignment,
 * left side array represents the targets for the assignments (elements 3 and 1
 * in the original)
 * right side array represents what is to be assigned to each respective element
 * in the left side array
 */

// change selection status of mappings in list
normal_priority_update_test.modified_mappings_object[0].selected = true;
normal_priority_update_test.modified_mappings_object[1].selected = false;
normal_priority_update_test.modified_mappings_object[3].selected = true;

// set up expected
[
	all_mappings_after[3],
	all_mappings_after[1]
] = [
	all_mappings_after[1],
	all_mappings_after[3]
];
all_mappings_after[0].selected = true;
all_mappings_after[1].selected = false;
all_mappings_after[3].selected = true;
normal_priority_update_test.expected = all_mappings_after;

// execute test
console.log(`executing test '${normal_priority_update_test.test_name}'`);
normal_priority_update_test.actual = applyMappingsPriorityUpdates(
	normal_priority_update_test.modified_mappings_object,
	normal_priority_update_test.mappings_to_update
);

// compare result to expected
normal_priority_update_test.result = JSON.stringify(normal_priority_update_test.expected) === JSON.stringify(normal_priority_update_test.actual);
console.assert(
	normal_priority_update_test.result,
	"%o",
	{ normal_priority_update_test, ERROR_MSG }
);

/* -- end normal function test -- */

/* -- begin test of larger update_object array than db_mappings array -- */
/* -- end test of larger update_object array than db_mappings array -- */

/* -- begin test of smaller update_object array than db_mappings array -- */
/* -- end test of smaller update_object array than db_mappings array -- */