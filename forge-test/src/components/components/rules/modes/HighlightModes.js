// https://gist.github.com/douglasduteil/5089187
import { CodeMirror } from 'vue-codemirror'

CodeMirror.defineMode('text', () => {
  // let g = 0

  const tokenBase = (stream) => {
    stream.next()
    return 'text'
  }

  return {
    startState: (base) => { /* g = 0 */ },
    token: tokenBase
  }
})

CodeMirror.defineMode('none', () => {
  // let g = 0

  const tokenBase = (stream) => {
    stream.next()
    return 'text'
  }

  return {
    startState: (base) => { /* g = 0 */ },
    token: tokenBase
  }
})

CodeMirror.defineMode('wildcard', () => {
  // const otherChar = /^[\^\$\.\+\?\*]/
  // let g = 0

  const tokenBase = (stream) => {
    let ch = stream.next()
    if (ch === '*') {
      return 'a'
    } else if (ch === '\\' && stream.match(/\\*\*/)) {
      return 'b'
    } else {
      return 'text'
    }
  }

  return {
    startState: (base) => { /* g = 0 */ },
    token: tokenBase
  }
}
)

CodeMirror.defineMIME('text/text', 'text')

CodeMirror.defineMode('regex', () => {
  const otherChar = /^[\^$.+?*]/
  let g = 0

  const tokenBase = (stream) => {
    let ch = stream.next()

    if (ch === '\\' && stream.match(/./, false)) {
      if (stream.match(/u\w{4}/)) { return 'a' } else if (stream.match(/u/)) { return 'err' } else if (stream.match(/x\w{2}/)) { return 'a' } else if (stream.match(/x/)) { return 'err' } else if (stream.match(/./)) { return 'a' }
      return 'a'
    }

    if (ch === '{') {
      if (stream.match(/(\d|\d,\d?)\}/)) {
        return 'a'
      }
    }

    if (ch === '[' && stream.match(/[^\]]+\]/)) {
      return 'b'
    } else if (ch === '|') {
      return 'g' + g
    } else if (ch === '(') {
      stream.match(/[?!:]+/)
      return 'g' + (++g % 5)
    }

    if (ch === ')') {
      if (g - 1 < 0) { return 'err' }
      return 'g' + (g-- % 5)
    }

    if (otherChar.test(ch)) {
      return 'a'
    }
  }

  return {
    startState: (base) => { g = 0 },
    token: tokenBase
  }
})

CodeMirror.defineMIME('text/x-regex', 'regex')
