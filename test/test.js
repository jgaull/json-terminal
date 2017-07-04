

var assert = require('assert')
var Terminal = require('../json-terminal.js')

describe('Terminal', function () {

	this.timeout(5000)

	var terminal

	before(function (done) {

		var commands = [{
			name: 'feed-tomato',
			options: [{
				longName: 'smile', //boolean
				shortName: 's',
				format: undefined
			},
			{
				longName: 'variety', //string
				shortName: 'v',
				format: undefined
			},
			{
				longName: 'quantity', //number
				shortName: 'q',
				format: undefined
			},
			{
				longName: 'matching', //object
				shortName: 'm',
				format: '{size, color, variety}'
			},
			{
				longName: 'to', //array
				shortName: 't',
				format: '[]'
			},
			{
				longName: 'method', //nested object
				shortName: 'd',
				format: '{name, parameters{duration, bothHands}, numTomatos}'
			},
			{
				longName: 'make-soup', //nested array and a hyphenated long name
				shortName: 'p',
				format: '{name, ingredients[]}'
			},
			{
				longName: 'matching-all', //array of objects and a hyphenated long name
				shortName: 'a',
				format: '[{size, color, variety}]'
			}]
		}]

		terminal = new Terminal({commands: commands})
	})

	it('parses a command', function (done) {

		var command = 'feed-tomato'
		var result = terminal.parse(command)

		assert(result)

		var command = result.command
		assert(command)
		assert.equal(command.name, 'feed-tomato')
		assert.equal(command.options.constructor, Array)
		assert.equal(command.options.length, 8)

		var data = result.data
		validateData(data, 0)

		done()
	})

	it('handles a boolean option', function (done) {

		var command = 'feed-tomato --smile'
		var result = terminal.parse(command)
		validateResult(result)

		var data = result.data
		validateData(data, 1)
		assert.strictEqual(data.smile, true)

		done()
	})

	it('handles a string option', function (done) {

		var command = 'feed-tomato --variety early girl'
		var result = terminal.parse(command)
		validateResult(result)

		var data = result.data
		validateData(data, 1)
		assert.equal(data.variety, 'early girl')

		done()
	})

	it('handles a number option', function (done) {

		var command = 'feed-tomato --quantity 12'
		var result = terminal.parse(command)
		validateResult(result)

		var data = result.data
		validateData(data, 1)
		assert.equal(typeof data.quantity, 'number')
		assert.equal(data.quantity, 12)

		done()
	})

	it('handles an object option', function (done) {

		var command = 'feed-tomato --matching {3.23, green, Green Zebra}'
		var result = terminal.parse(command)
		validateResult(result)

		var data = result.data
		validateData(data, 1)

		var matching = data.matching
		assert(matching)
		assert.equal(typeof matching, 'object')
		assert.equal(matching.size, 3.23)
		assert.equal(matching.color, 'green')
		assert.equal(matching.variety, 'Green Zebra')

		done()
	})

	it('handles an array option', function (done) {

		var command = 'feed-tomato --to [Bill Nye, Ronald McDonald, Mr. T]'
		var result = terminal.parse(command)
		validateResult(result)

		var data = result.data
		validateData(data, 1)

		var to = data.to
		assert(to)
		assert.equal(to.constructor, Array)
		assert.equal(to.length, 3)
		assert.equal(to[0], 'Bill Nye')
		assert.equal(to[1], 'Ronald McDonald')
		assert.equal(to[2], 'Mr. T')

		done()
	})

	it('handles an option with a nested object', function (done) {

		var command = 'feed-tomato --method {Over the head, {3.3, true}, 2}'
		var result = terminal.parse(command)
		validateResult(result)

		var data = result.data
		validateData(data, 1)

		var method = data.method
		assert(method)
		assert.equal(typeof method, 'object')
		assert.equal(method.name, 'Over the head')
		assert.equal(method.numTomatos, 2)

		var parameters = method.parameters
		assert(parameters)
		assert.equal(parameters.duration, 3.3)
		assert.strictEqual(parameters.bothHands, true)

		done()
	})

	it('handles an option with a nested array', function (done) {

		var command = 'feed-tomato --make-soup {Cream of Tomato, [cream, tomato paste, roasted tomatos]}'
		var result = terminal.parse(command)
		validateResult(result)

		var data = result.data
		validateData(data, 1)

		var makeSoup = data.makeSoup
		assert(makeSoup)
		assert.equal(typeof makeSoup, 'object')
		assert.equal(makeSoup.name, 'Cream of Tomato')

		var ingredients = makeSoup.ingredients
		assert(ingredients)
		assert.equal(ingredients.constructor, Array)
		assert.equal(ingredients.length, 3)
		assert.equal(ingredients[0], 'cream')
		assert.equal(ingredients[1], 'tomato paste')
		assert.equal(ingredients[2], 'roasted tomatos')

		done()
	})

	it('handles an option with an array of objects', function (done) {

		var command = 'feed-tomato --matching-all [{2, red, Early Girl}, {1, green, Green Zebra}]'
		var result = terminal.parse(command)
		validateResult(result)

		var data = result.data
		validateData(data, 1)

		var matchingAll = data.matchingAll
		assert(matchingAll)
		assert.equal(matchingAll.constructor, Array)
		assert.equal(matchingAll.length, 2)

		var matchingFirst = matchingAll[0]
		assert(matchingFirst)
		assert.equal(matchingFirst.size, 2)
		assert.equal(matchingFirst.color, 'red')
		assert.equal(matchingFirst.variety, 'Early Girl')

		var matchingSecond = matchingAll[1]
		assert(matchingSecond)
		assert.equal(matchingSecond.size, 1)
		assert.equal(matchingSecond.color, 'green')
		assert.equal(matchingSecond.variety, 'Green Zebra')

		done()
	})

	it('throws an error when given a command that is not configured', function (done) {

		var command = 'feed-apple'
		var result = terminal.parse(command)

		try {
			terminal.parse(command)
			done('terminal.parse() should have thrown an error')
		}
		catch (e) {
			assert.equal(e.message, 'Sorry, there is no command named feed-apple.')
		}

		done()
	})

	it('handles commands with multiple options', function (done) {

		var command = 'feed-tomato --smile --matching-all [{2, red, Early Girl}, {1, green, Green Zebra}]'
		var result = terminal.parse(command)
		validateResult(result)

		var data = result.data
		validateData(data, 1)

		assert.strictEqual(data.smile, true)

		var matchingAll = data.matchingAll
		assert(matchingAll)
		assert.equal(matchingAll.constructor, Array)
		assert.equal(matchingAll.length, 2)

		var matchingFirst = matchingAll[0]
		assert(matchingFirst)
		assert.equal(matchingFirst.size, 2)
		assert.equal(matchingFirst.color, 'red')
		assert.equal(matchingFirst.variety, 'Early Girl')

		var matchingSecond = matchingAll[1]
		assert(matchingSecond)
		assert.equal(matchingSecond.size, 1)
		assert.equal(matchingSecond.color, 'green')
		assert.equal(matchingSecond.variety, 'Green Zebra')

		done()
	})
	//handles boolean options using the short name
	//handles string options using the short name
	//escapes text between single quotes
	//escapes text between double quotes
	//throws an error if an unknown option is used
	//throws an error if the command contains the same option more than once
	//throws an error if the command contains the same option more than once, even if they don't use the same name
})

function validateResult(result) {

	assert(result)

	var command = result.command
	assert(command)
	assert.equal(command.name, 'feed-tomato')
	assert.equal(command.options.constructor, Array)
	assert.equal(command.options.length, 8)
}

function validateData(data, numKeys) {
	assert(data)
	assert.equal(data, typeof 'object')
	assert.equal(Object.keys(data).length, numKeys)
}


