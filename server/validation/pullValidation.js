const Joi = require('joi')

const pullStruc = Joi.object({
    projectID: Joi.string().required(),
    timestamp: Joi.date().required(),
    userID: Joi.string().required(),
    contributerName: Joi.string().required(),
    projectName: Joi.string().required(),
    updatedChapter: Joi.string().required(),
    message: Joi.string(),
    contributerID: Joi.string().required()
})

module.exports = pullStruc
