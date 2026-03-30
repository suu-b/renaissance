const Joi = require('joi')

const chapterStruc = Joi.object({
    title: Joi.string().required(),
    dateCreated: Joi.date().required(),
    userID : Joi.string().required(),
    content: Joi.string().required()
})

module.exports = chapterStruc