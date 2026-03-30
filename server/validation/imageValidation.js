const validFileTypes = ['image/jpg', 'image/jpeg', 'image/png']

const imageValidation = (file) => {
    if (!file) {
        console.log("No file provided")
        return false
    }
    if (!validFileTypes.includes(file.mimetype)) {
        console.log("Wrong file type")
        return false
    }
    return true
}

module.exports = imageValidation