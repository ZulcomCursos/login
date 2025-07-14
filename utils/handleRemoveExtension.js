const removeExtension = (fileName) => {

    return fileName.split('.').shift()
}

module.exports = removeExtension