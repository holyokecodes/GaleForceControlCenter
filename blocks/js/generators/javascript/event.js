'use strict';

goog.provide('Blockly.JavaScript.event');

goog.require('Blockly.JavaScript');

Blockly.JavaScript['event_whenflagclicked'] = function (block) {

    let code = `
(async function greenFlag() { 
    try {
        await blockMessage('reset');
`;

    return [code, Blockly.JavaScript.ORDER_NONE];
}