const Joi = require('joi')

const projectStruc = Joi.object({
    title: Joi.string().required(),
    dateCreated: Joi.date().required(),
    description: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
    contributors: Joi.array().items(Joi.string()),
    status: Joi.string().required(),
    projectOwner: Joi.string().required(),
    projectOwnerName: Joi.string().required()
})

module.exports = projectStruc