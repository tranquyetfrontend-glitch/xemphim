import Joi from 'joi';
export const RegisterSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9])'))
        .required(),
    full_name: Joi.string().required(),
    phone: Joi.string().optional()
});