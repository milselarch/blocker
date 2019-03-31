import Enum from '@/Enum.js'
import assert from '@/assert.js'
// import { program } from 'babel-types'

class Rule {
  static nameTypes = Enum('text', 'wildcard', 'regex');
  static programTypes = Enum('text', 'wildcard', 'regex');

  constructor ({
    name = '',
    nameType = 'text',
    programName = '',
    programType = 'text',
    platform = 'win32',
    blockDuration = 300,
    lockTime = 300,
    saved = false
  }) {
    const self = this
    self.saved = saved

    self.setName = (name, nameType) => {
      assert(Rule.nameTypes.includes(nameType))
      self.name = name
    }
    self.setProgram = (programName, programType) => {
      assert(Rule.programTypes.includes(programType))
      self.programName = programName
    }
    self.setBlockDuration = (blockDuration) => {
      self.blockDuration = blockDuration
    }
    self.setLockTime = (lockTime) => {
      self.lockTime = lockTime
    }
    self.setPlatform = (platform) => {
      self.platform = platform
    }

    self.save = () => {
      self.saved = true
    }

    self.setName(name, nameType)
    self.setProgram(programName, programType)
    self.setBlockDuration(blockDuration)
    self.setLockTime(lockTime)
  }
}

export default Rule
