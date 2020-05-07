module.exports = function(req, res, next) {
    req.validate = function() {
        return req.getValidationResult().then((result) => new Promise((resolve, reject) => {
            // get errors
            var errors = result.isEmpty() ? [] : result.array().map((error) => error.msg).filter(function(elem, index, self) {
                return index == self.indexOf(elem);
            });
            // error(s) occurred?
            if (errors.length > 0) {
                // return error
                reject({
                    code        : 400,
                    messages    : errors
                });
            // valid data
            } else {
                // finished
                resolve();
            }
        }));
    };
    // finished
    next();
};