// utils.js
export {
    DEBUG,
    logDebug,
    convertNodeType
};

const DEBUG = true;

function logDebug(messages, trace=true) {
    if (trace) {
        console.trace();
    }
    let callingFunc = getUniqueCallerName();
    console.log(`from ${callingFunc}`);
    for (let i=0; i<messages.length; i++) {
        console.log(messages[i]);
    }
}

function getUniqueCallerName() {
    try {
        throw new Error();
    } catch (error) {
        const stackLines = error.stack.split('\n');
        // Start from the second line to skip the getUniqueCallerName itself
        for (let i = 2; i < stackLines.length; i++) {
            const callerLine = stackLines[i];
            const matches = /at\s+([^\s\(]+)/.exec(callerLine);
            if (matches && !/(Promise\.|<anonymous>)/.test(matches[1])) {
                return matches[1];
            }
        }
        return 'UnknownFunction';
    }
}

function convertNodeType(nodeType) {
	switch (nodeType) {
		case 1:
			return "element node";
		case 2:
			return "attribute node";
		case 3:
			return "text node";
		case 4:
			return "'cdata section' node (like <!CDATA[[...]]>)";
		case 7:
			return "processing instruction node (like <?xml-stylesheet ...>)";
		case 8:
			return "comment node";
		case 9:
			return "document node";
		case 10:
			return "document type node (like <!DOCTYPE html>)";
		case 11:
			return "DocumentFragment node";
		default:
			return `unrecognized type ${nodeType}`;
	}
}