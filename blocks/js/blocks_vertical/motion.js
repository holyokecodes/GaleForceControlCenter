'use strict';

goog.provide('Blockly.Blocks.motion');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


Blockly.Blocks['motion_drive_forward'] = {
    /**
     * Block to move steps.
     * @this Blockly.Block
     */
    init: function () {
        this.jsonInit({
            "message0": "drive forward %1 meters",
            "args0": [
                {
                    "type": "input_value",
                    "name": "DISTANCE"
                }
            ],
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

Blockly.Blocks['motion_drive_forward_reverse'] = {
    /**
     * Block to move steps.
     * @this Blockly.Block
     */

    init: function () {
        this.jsonInit({
            "message0": "drive %1 %2 meters",
            "args0": [{
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [
                    ['forward', 'forward'],
                    ['reverse', 'reverse']
                ]
                },
                {
                    "type": "input_value",
                    "name": "DISTANCE"
                }
            ],
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

Blockly.Blocks['motion_stop'] = {
    /**
     * Block to stop
     * @this Blockly.Block
     */
    init: function () {
        this.jsonInit({
            "message0": "stop",
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

Blockly.Blocks['motion_follow_curb_for'] = {
    /**
     * Block to follow curve for a given distance
     * @this Blockly.Block
     */
    init: function () {
        this.jsonInit({
            "message0": "follow curb for %1 meters",
             "args0": [
                {
                    "type": "input_value",
                    "name": "DISTANCE"
                }
            ],
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

Blockly.Blocks['motion_follow_curb'] = {
    /**
     * Block to follow curve
     * @this Blockly.Block
     */
    init: function () {
        this.jsonInit({
            "message0": "follow curb",
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

Blockly.Blocks['motion_turn_right_left'] = {
    /**
     * Block to move steps.
     * @this Blockly.Block
     */
    init: function () {
        this.jsonInit({
            "message0": "turn %1",
            "args0": [{
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [
                    ['right', 'right'],
                    ['left', 'left']
                ]
            }],
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

Blockly.Blocks['motion_turn'] = {
    /**
     * Block to move steps.
     * @this Blockly.Block
     */
    init: function () {
        this.jsonInit({
            "message0": "turn %1 degrees",
            "args0": [
                {
                    "type": "input_value",
                    "name": "ANGLE"
                }
            ],
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

Blockly.Blocks['motion_pick_up'] = {
    /**
     * Block to pickup
     * @this Blockly.Block
     */
    
    init: function () {
        this.jsonInit({
            "message0": "pick up",
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

Blockly.Blocks['motion_deliver'] = {
    /**
     * Block to deliver
     * @this Blockly.Block
     */
    init: function () {
        this.jsonInit({
            "message0": "deliver",
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

Blockly.Blocks['motion_doors'] = {
    /**
     * Block to open/close doors
     * @this Blockly.Block
     */
    init: function () {
        this.jsonInit({
            "message0": "doors %1",
            "args0": [{
                "type": "field_dropdown",
                "name": "OPENCLOSE",
                "options": [
                    ['open', 'open'],
                    ['close', 'close']
                ]
            }],
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

Blockly.Blocks['drone_fly'] = {
    /**
     * Block to fly distance in direction
     * @this Blockly.Block
     */

    init: function () {
        this.jsonInit({
            "message0": "fly %1 %2 meters",
            "args0": [{
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [
                    ['forward', 'forward'],
                    ['reverse', 'reverse'],
                     ['left', 'left'],
                     ['right', 'right'],
                     ['up', 'up'],
                     ['down', 'down']
                ]
                },
                {
                    "type": "input_value",
                    "name": "DISTANCE"
                }
            ],
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

Blockly.Blocks['drone_land'] = {
    /**
     * Block to land
     * @this Blockly.Block
     */

    init: function () {
        this.jsonInit({
            "message0": "land",
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};



Blockly.Blocks['drone_fly_to_coords'] = {
    /**
     * Block to fly to z,y,z coords
     * @this Blockly.Block
     */
    init: function () {
        this.jsonInit({
            "message0": "fly to x:%1 y:%2 z:%3",
             "args0": [
                {
                    "type": "input_value",
                    "name": "X"
                },
                 {
                    "type": "input_value",
                    "name": "Y"
                },
                {
                    "type": "input_value",
                    "name": "Z"
                },
            ],
            "category": Blockly.Categories.motion,
            "extensions": ["colours_motion", "shape_statement"]
        });
    }
};

