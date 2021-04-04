'use strict';

goog.provide('Blockly.JavaScript.sensing');

goog.require('Blockly.JavaScript');

/*Blockly.JavaScript['sees_object'] = function (block) {

    const see = block.getFieldValue('SEE');

    let code = 'true';

    return [code, Blockly.JavaScript.ORDER_NONE];
}*/

Blockly.JavaScript['at_object'] = function (block) {

    var value_object = block.getFieldValue('OBJECT');

    let code = 'sensor.includes("' + value_object + '")';

    return [code, Blockly.JavaScript.ORDER_ATOMIC];
}

Blockly.JavaScript['at_house'] = function (block) {

    var value_object = Blockly.JavaScript.valueToCode(block, 'HOUSENUMBER', Blockly.JavaScript.ORDER_ATOMIC);

    let code = '\tawait blockMessage("at", ' + value_object + ');';

    return code;
}

Blockly.JavaScript['distance'] = function (block) {

    var value_object = block.getFieldValue('OBJECT');

    let code = '\tawait blockMessage("distance", "' + value_object + '");';

    return code;
}