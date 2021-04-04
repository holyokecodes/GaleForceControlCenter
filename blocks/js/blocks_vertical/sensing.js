'use strict';

goog.provide('Blockly.Blocks.sensing');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


Blockly.Blocks['at_object'] = {
    /**
     * Block to report Y.
     * @this Blockly.Block
     */
    init: function () {
        this.jsonInit({
            "message0": "at %1",
            "args0": [{
                "type": "field_dropdown",
                "name": "OBJECT",
                "options": [
                    ['airport', 'airport'],
                    ['dog', 'dog'],
                    ['evac-center', 'evac-center'],
                    ['hospital', 'hospital'],
                    ['person', 'person'],
                    ['port', 'port'],
                    ['stop sign', 'stop sign']
                ]
            }],
            "category": Blockly.Categories.sensing,
            "extensions": ["colours_sensing", "output_boolean"]
        });
    }
};

Blockly.Blocks['at_house'] = {
    /**
     * Block to report Y.
     * @this Blockly.Block
     */
    init: function () {
        this.jsonInit({
            "message0": "at house %1",
            "args0":  [
                {
                    "type": "input_value",
                    "name": "HOUSENUMBER"
                }
            ],
            "category": Blockly.Categories.sensing,
            "extensions": ["colours_sensing", "output_boolean"]
        });
    }
};


Blockly.Blocks['distance'] = {
  /**
   * Block for distance to object
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "distance to %1",
      "args0": [{
                "type": "field_dropdown",
                "name": "OBJECT",
                "options": [
                    ['airport', 'airport'],
                    ['debris', 'debris'],
                    ['dog', 'dog'],
                    ['evac-center', 'evac-center'],
                    ['hospital', 'hospital'],
                    ['person', 'person'],
                    ['port', 'port'],
                    ['stop sign', 'stop sign']
                ]
            }],
            "category": Blockly.Categories.sensing,
            "extensions": ["colours_sensing", "output_number"]
        });
    }
};