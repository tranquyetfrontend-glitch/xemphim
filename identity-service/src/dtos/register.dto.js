import Joi from 'joi';
export const RegisterSchema = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9])'))
        .required(),
    full_name: Joi.string().required(),
    phone: Joi.string().optional()
});