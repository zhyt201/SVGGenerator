'use strict';

function dashLized(raw) {
    //convert pascal or camelcased string to angular - separated
    return raw.charAt(0).toLowerCase() + raw.substr(1).replace(/[A-Z]/g, '-$&').toLowerCase();
}

function camelCased(input, firstCap) {
    if (input) {
        input = input.trim();
        if (!/\d/g.test(input[0])) {
            var reg = /-(\w)/;
            if (firstCap) {
                input = input[0].toUpperCase() + input.substring(1);
            }
            while (reg.test(input)) {
                var match = reg.exec(input);
                input = input.replace(match[0], match[1].toUpperCase());
            }
            return input;
        }
    }
    return '';
}

function pascalCased(input) {
    return camelCased(input, true);
}

module.exports = {
    dashLized: dashLized,
    camelCased: camelCased,
    pascalCased: pascalCased
};
