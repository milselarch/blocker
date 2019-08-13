module.exports = (condition) => {
  if (!condition) {
    // const err = new Error()
    // console.error(err.stack)
    throw new Error(`��� ASSERTION FAILED ���`)
  }
}
