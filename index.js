var irc = require('irc')
var FuzzySet = require('fuzzyset.js')

// Source: http://mtgjson.com/
var cards = require('./AllCards.json')
var sets = require('./AllSets.json')
var cardNames = Object.keys(cards)
var cardNamesFuzzySet = new FuzzySet(cardNames, true, 2, 3)


var server = 'irc.freenode.net'
var channel = 'coolkidsusa'
//var channel = 'junkyard'
var botName = 'mtgbot'

var client = new irc.Client(server, botName, { channels: ['#' + channel] } )

var say = function(msg) {
  client.say('#' + channel, msg)
}

client.on('join', function(event) {
  console.log('[connect]')
  console.log(event)
})

client.on('message', function(from, to, message) {
  console.log('[message]', from + ': ' + message)
  var isToUs = message.indexOf(botName) === 0
  var messageToUs = message.match(/mtgbot:? ?(.*)/) && RegExp.$1
  console.log(messageToUs)

  if(message.match(/flavor/)) {
    say(randomFlavor())
  }
  else if(messageToUs) {
    var cardMatches = findCardMatch(message)
    if (cardMatches) {
      var cardName = cardMatches[0][1]
      var card = cards[cardName]
      console.log(card)
      say(formatCard(card))
    }
  }
})

client.on('error', function(event) {
  console.error('[error] !', event)
})

function formatCard (card) {
  var str = card.name + " - " + card.manaCost + "\n" + card.text
  if(card.power || card.toughness) {
    str += ".  " + card.power + " / " + card.toughness
  }
  return str
}

function findCardMatch (text) {
  return cardNamesFuzzySet.get(text)
}

function randomFlavor () {
  var card = random(random(sets).cards)
  console.log(card)
  return card.flavor || randomFlavor()
}

function random (thing) {
  console.log('random', thing)
  if (!thing) {
    return null
  } else if (typeof thing === 'number') { // Return random int
    return Math.floor(Math.random() * thing)
  } else if (Array.isArray(thing)) { // Return random element from array
    return thing[random(thing.length)]
  } else { // Return random value from object
    return thing[random(Object.keys(thing))]
  }
}

if (require.main == module) {
  console.log(cardNamesFuzzySet.get('flametonge kavu'))
  console.log(cardNamesFuzzySet.get('drac'))
  console.log(cardNamesFuzzySet.get('Akroma'))
  console.log(cardNamesFuzzySet.get('Akroma, angel of'))
  console.log(cardNamesFuzzySet.get('yea, i gotta add 4 hermit druids to the deck'))
}

