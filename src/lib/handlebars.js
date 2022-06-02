const { format } = require("timeago.js");
var today = new Date();

const helpers = {};
const helpers2 = {};


function now() {
    return "Fecha Hoy";
}


helpers.timeago = (timestamp) => {
    return format(timestamp);
}
module.exports = helpers;

