'use strict';

goog.provide('Blockly.JavaScript.motion');

goog.require('Blockly.JavaScript');

Blockly.JavaScript['motion_drive_forward'] = function (block) {

    var value_distance = Blockly.JavaScript.valueToCode(block, 'DISTANCE', Blockly.JavaScript.ORDER_ATOMIC);

    let code = '\tawait blockMessage("drive forward", ' + value_distance + ');';

    return code;
}
Blockly.JavaScript['motion_drive_forward_reverse'] = function (block) {

    var value_direction = block.getFieldValue('DIRECTION');  // use this for dropdowns
    var value_distance = Blockly.JavaScript.valueToCode(block, 'DISTANCE', Blockly.JavaScript.ORDER_ATOMIC);

    let code = '\tawait blockMessage("drive ' + value_direction + '",' + value_distance + ');';
   
    return code;
}

Blockly.JavaScript['motion_stop'] = function (block) {

    let code = '\tawait blockMessage("stop");';

    return code;
}

Blockly.JavaScript['motion_follow_curb_for'] = function (block) {

    var value_distance = Blockly.JavaScript.valueToCode(block, 'DISTANCE', Blockly.JavaScript.ORDER_ATOMIC);

    let code = '\tawait blockMessage("follow curb for", ' + value_distance + ');';

    return code;
}


Blockly.JavaScript['motion_follow_curb'] = function (block) {

    let code = '\tawait blockMessage("follow curb");';

    return code;
}

Blockly.JavaScript['motion_turn'] = function (block) {

    var value_degrees = Blockly.JavaScript.valueToCode(block, 'ANGLE', Blockly.JavaScript.ORDER_ATOMIC);

    let code = '\tawait blockMessage("turn", ' + value_degrees + ');';

    return code;
}

Blockly.JavaScript['motion_turn_right_left'] = function (block) {

    var value_direction = block.getFieldValue('DIRECTION'); 
    let degrees = 90;
    if (value_direction == "left")
        degrees = -90;

    let code = '\tawait blockMessage("turn", ' + degrees + ');';

    return code;
}

Blockly.JavaScript['motion_pick_up'] = function (block) {

    // var value_object = block.getFieldValue('OBJECT');

    let code = '\tawait blockMessage("pick up", "none");';

    return code;
}

Blockly.JavaScript['motion_deliver'] = function (block) {

    // var value_object = block.getFieldValue('OBJECT');

    let code = '\tawait blockMessage("deliver", "none");';

    return code;
}

Blockly.JavaScript['motion_doors'] = function (block) {

    var value_action = block.getFieldValue('OPENCLOSE');

    let code = '\tawait blockMessage("doors", "' + value_action + '");';

    return code;
}

Blockly.JavaScript['drone_fly'] = function (block) {

    var value_direction = block.getFieldValue('DIRECTION');  // use this for dropdowns
    var value_distance = Blockly.JavaScript.valueToCode(block, 'DISTANCE', Blockly.JavaScript.ORDER_ATOMIC);

    let code = `	await blockMessage("fly ${value_direction}", ${value_distance});`;
   
    return code;
}

Blockly.JavaScript['drone_land'] = function (block) {

    let code = '\tawait blockMessage("land");';

    return code;
}

Blockly.JavaScript['drone_fly_to_coords'] = function (block) {

   
    var value_x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ATOMIC);
    var value_y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC);
    var value_z = Blockly.JavaScript.valueToCode(block, 'Z', Blockly.JavaScript.ORDER_ATOMIC);
    console.log(value_x);
    let code = `	await blockMessage("fly to", "{ x: ${value_x}, y: ${value_y}, z: ${value_z}}");`;
   
    return code;
}