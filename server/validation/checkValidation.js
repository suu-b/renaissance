const Joi = require('joi')

const validateData = (data, schema) => {
    const { error } = schema.validate(data)
    if (error) {
        console.log(error)
        return false
    }
    else {
        return true
    }
}

module.exports = validateData