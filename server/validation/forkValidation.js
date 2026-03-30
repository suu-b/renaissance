const Joi = require('joi')

const forkStruc = Joi.object({
    dateCreated : Joi.date().required(),
    chapters :Joi.array().items(Joi.string()).required()
})

module.exports = forkStruc