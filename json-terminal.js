

function Terminal(params) {

	var options = params.options
	if (!options) {
		throw new Error ('options is a required parameter')
	}

	this.commands = params.commands
}

function parse(string) {

}