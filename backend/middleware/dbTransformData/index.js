export const removeId = (req, res, next) => {
/* removes _id property when returning database documents as json */
// https://lemnik.wordpress.com/2017/07/31/writing-express-middleware-to-modify-the-response/
    res.format({
        'application/json': () => {
            const json_ = res.json;
            res.json = function(data) {
                if(data instanceof Array) {
                    data.forEach(item => {
                        if (Object(item).hasOwnProperty('_id'))
                            delete item._id;
                    });
                }
                else if(typeof data === 'object') {
                    if (Object(data).hasOwnProperty('_id'))
                        delete data._id;
                }
                json_.call(res, data);
            }
        }
    });

    next();
};

export const unixToJsDatetime = (req, res, next) => {
    res.format({
        'application/json': () => {
            const json_ = res.json;
            res.json = function(data) {
                if(data instanceof Array) {
                    data.forEach(item => {
                        if (Object(item).hasOwnProperty('hourly'))
                            item.hourly.forEach(hr => {
                                hr.dt *= 1000;
                            })
                    });
                }
                else if(typeof data === 'object') {
                    if (Object(data).hasOwnProperty('hourly'))
                        data.hourly.forEach(hr => {
                            hr.dt *= 1000;
                        })
                }
                json_.call(res, data);
            }
        }
    });

    next();
}