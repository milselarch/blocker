import misc from './misc.js'
const assert = require('./assert.js')

function isMethod (variable, attr) {
  if (variable[attr] !== undefined) {
    if (!variable.hasOwnProperty(attr)) {
      // is not dynamic attrivute aka keys
      return true
    }
  }

  return false
}

function Enum () {
  // shallow copy
  const args = Array.from(arguments)
  console.log('MISC', misc, misc.hasDuplicates)
  assert(!(args.includes('ALL')))
  assert(!misc.hasDuplicates(args))

  const mapping = {}
  args.forEach(item => {
    assert(typeof item === 'string')
    assert(![
      'length', 'includes', 'ALL'
    ].includes(item))

    mapping[item] = item
  })

  const allowedValues = args.slice(0)
  const frozenMapping = Object.freeze(mapping)
  const newEnum = new Proxy(frozenMapping, {
    get: function (target, name) {
      console.log('INCLDES', target, name)
      if (name === 'ALL') {
        return allowedValues.slice(0)
      } else if (name === 'length') {
        return allowedValues.length
      } else if (name === 'includes') {
        return value => allowedValues.includes(value)
      } else if (isMethod(allowedValues, name)) {
        return allowedValues.slice(0)[name]
      } else if (!(name in frozenMapping)) {
        console.log('NAME EXISTS NOYT', frozenMapping)
        throw new Error(`ENUM PROP DOES NOT EXIST ${name}`)
      }

      return frozenMapping[name]
    },

    set: function (target, name, value) {
      throw new Error(`ENUM IS READONLY - ${name} = ${value}, ${target}`)
    }
  })

  return Object.freeze(newEnum)
}

export default Enum
