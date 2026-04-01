const createError = (status, message, errors) => {
    const err = new Error(message);
    err.status = status;
    err.message = message;
    if (Array.isArray(errors) && errors.length > 0) {
        err.errors = errors;
    }
    return err;
};
export default createError;
