var workspace = null;
var sensor = [];
// current robot name
var robot = "";
var team = "0";
var player = "0";
var mission_id = "0";
var grid = "off"; 
var missions;
var missiondescription = "";

// this is reset in vuplexutils when entering new mission, and pushed in saveToFirebase with greenflag
var playerCodeChanges = 0; 
// last code from firebase
var codeFromFirebase;

// Custom color changes - slightly darker
Blockly.Colours.control.primary = "#FCA102"; // original "#FFAB19";
Blockly.Colours.event.primary = "#F6B903"; // original "#FFBF00"

var toolbox = Blockly.Blocks.defaultToolbox;

document.addEventListener("DOMContentLoaded", start());
function start() {
    /*var match = location.search.match(/dir=([^&]+)/);
    var rtl = match && match[1] == 'rtl';
    var toolbox = getToolboxElement();
    match = location.search.match(/side=([^&]+)/);
    var side = match ? match[1] : 'start';
    match = location.search.match(/locale=([^&]+)/);
    var locale = match ? match[1] : 'en';
    Blockly.ScratchMsgs.setLocale(locale); */

    // Create main workspace.
    workspace = Blockly.inject('blocklyDiv', {
        comments: true,
        disable: false,
        collapse: true,
        media: 'media/',
        readOnly: false,
       // rtl: rtl,
        scrollbars: true,
        toolbox: toolbox,
        toolboxPosition: 'start',
       // toolboxPosition: side == 'top' || side == 'start' ? 'start' : 'end',
        horizontalLayout: false,
       // horizontalLayout: side == 'top' || side == 'bottom',
        trashcan: true,
        sounds: false,
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1, // .75 initially
            maxScale: 4,
            minScale: 0.25,
            scaleSpeed: 1.1
        },
        colours: {
            fieldShadow: 'rgba(255, 255, 255, 0.3)',
            dragShadowOpacity: 0.6
        }
    });
    
    // disable any block not connected to the green flag block 
    workspace.addChangeListener(Blockly.Events.disableOrphans);

    /* will be added by vuplexutils.js in new mission
    let greenFlagBlock = workspace.newBlock('event_whenflagclicked');
    greenFlagBlock.initSvg();
    greenFlagBlock.render(); */

    workspace.scrollCenter();

    document.getElementById('greenflag-button').onclick = (() => {
      let code = generateJavaScript();
      // Save workspace to Firebase
      runCount++;
      saveToFirebase();
      //console.log(code);
      eval(code);
    });

    document.getElementById('stop-button').onclick = (() => {
        let code = '(async function greenFlag() { await blockMessage("stop"); })();';
        eval(code);
    });
    document.getElementById('save-button').onclick = (() => {
        //let code = generateJavaScript();
        //Ask to name code and then save in firebase with that name
         // suggest player + mission + saveCount
         getSavedNames("save");
    });
   
   document.getElementById('load-button').onclick = (() => {
        getSavedNames("load");
    });
}

var namesUsed = [];
var savedBlocks = {};
var options = "";

// Called by load button and save button 
function getSavedNames(calledFrom)
{
     // Find all saved names and blocks in firebase for the team
     // Or should we just do this once and then push changes?
     // Decided to read when we need to, instead of sync pushes because probably less work?
     firebase.database().ref(`teams/${team}/saved-blocks`).once('value', function (snapshot) {
          namesUsed = [];
          options = "";
          snapshot.forEach(function(childSnapshot) {
            let key = childSnapshot.key;
            let item = childSnapshot.val();
            namesUsed.push(key);
            savedBlocks[key] = item;
            //console.log("snapshot " + namesUsed);
            options += "<option value=" + key + ">" + decodeURIComponent(key) + "</option>";
       });
       if (calledFrom == "load") {
            if (namesUsed.length > 0) 
                 showSelectModal("Choose the name of the code you want to load:", options, loadCallback);
            else 
                 modalAlert("There is no code saved from your team.");
       } else  if (calledFrom == "save") {
               modalPrompt("Name the code:", player + "-" + mission_id + "-" + saveCount, saveToFirebase);
       } else
            console.log("error calledFrom in getSavedNames: " + calledFrom);
     });
}

// save latest code change which will be pushed to rest of team
function syncMissions(event) {
  // console.log(JSON.stringify(event));
  const eventTypes = [Blockly.Events.BLOCK_MOVE, Blockly.Events.BLOCK_CHANGE];

  if(eventTypes.includes(event.type)) {
    if(event.type == Blockly.Events.BLOCK_MOVE && event.oldParentId != undefined && event.newParentId == undefined) {
      // Detaching from parent, skip
      return;
    }
    console.log("this is code that should be synced");
    playerCodeChanges++
    let xml = Blockly.Xml.workspaceToDom(workspace);
    let xmlStr = Blockly.Xml.domToPrettyText(xml);
    codeFromFirebase = missions[mission_id]['blocks'];
    console.log(codeFromFirebase);
    // console.log(xmlStr);
    // Compare code with last update from firebase to prevent pushing the same change back
    if (codeFromFirebase != undefined && xmlStr != codeFromFirebase) {
      console.log("changed");
      let dbref = firebase.database().ref(`teams/${team}/${mission_id}`);
      console.log("Updating mission " + mission_id + " for player " + player);
      if (dbref) {
        return dbref.update({ blocks: xmlStr, player });              
      }
    }
  }
}

function subscribeToMissions() {
  firebase.database().ref(`teams/${team}`).on('value', 
    (snapshot) => {
      missions = snapshot.val();
      if (missions && mission_id in missions) {
        codeFromFirebase = missions[mission_id]['blocks'];
          // If the mission has already been started
          // only update the workspace if the code has changed
          // and the change wasn't made by you
        if (missions[mission_id]['player'] !== player) {
          console.log("Found changes in mission " + mission_id + " from player " + missions[mission_id]['player'] );
          const xml = Blockly.Xml.workspaceToDom(workspace);
          const current_blocks = Blockly.Xml.domToPrettyText(xml);
          if (current_blocks !== codeFromFirebase) {
            const dom = Blockly.Xml.textToDom(codeFromFirebase);
            workspace.clear();
            Blockly.Xml.domToWorkspace(dom, workspace);
          }
        } 
      }
    }
  );
}

// For the training missions, always listen to team0 for instructors? and saved code gets copied to all?
// pre-condition: called when mission changed to a mission starting with T in vuplexutils.js
function syncTrainingMission() {
   firebase.database().ref(`teams/team0/${mission_id}`).on('value', 
    (snapshot) => {
      const item = snapshot.val();
      const blocks = item.blocks;
      if (item && blocks && item.player !== player) {
        console.log("Found changes in mission " + mission_id + " from player " + item.player );
        
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const current_blocks = Blockly.Xml.domToPrettyText(xml);
         if (current_blocks !== blocks) {
          const dom = Blockly.Xml.textToDom(blocks);
          workspace.clear();
          Blockly.Xml.domToWorkspace(dom, workspace);
        }
      } 
   });
}
// Called when you join a mission, to either get code from firebase 
// from your teammates or clear the workspace.
function getInitialCode() {
  
     // local _workspace didn't work here: const _workspace = Blockly.getMainWorkspace();
   
  firebase.database().ref(`teams/${team}/${mission_id}`).once('value', 
  (snapshot) => {
      if (snapshot.exists()) {
        let item = snapshot.val();
        let code = item.blocks;
        console.log("Got initial code in " + mission_id + " from player " +  item.player );
        workspace.clear();
        const dom = Blockly.Xml.textToDom(code);
        Blockly.Xml.domToWorkspace(dom, workspace);
      } else {
        workspace.clear();
        const startBlock = '<xml xmlns=\"http://www.w3.org/1999/xhtml\">\n  <variables></variables>\n  <block type=\"event_whenflagclicked\" id=\"W[8Nl[70ttY=$3$7Rax9\" x=\"-295\" y=\"-317\"></block>\n</xml>';
        const dom = Blockly.Xml.textToDom(startBlock);
        Blockly.Xml.domToWorkspace(dom, workspace);  
      }
    }
  );
}

// Called by the selectModal enter button to load code
function loadCallback(input)
{
     console.log(input);
     let code = savedBlocks[input];
     console.log(code);
     let dom = Blockly.Xml.textToDom(code);
     Blockly.Xml.appendDomToWorkspace(dom, workspace); 
}

var runCount = 0;
var saveCount = 0;
var lastPushKey;
function saveToFirebase(name = "") {
  name = encodeURIComponent(name);
  let xml = Blockly.Xml.workspaceToDom(workspace);
  let xmlStr = Blockly.Xml.domToPrettyText(xml);
  //console.log(xmlStr);
  
  let now = Date().toString();
  // a flatter structure 
  let dbref = firebase.database().ref("archive"); 
  
  if (namesUsed.includes(name))
    modalAlert("Please choose a new name!<br>" + name + " already exists.");
  else  { 
    if (name != "") {
      // push to firebase to share with team  
      saveCount++;
      firebase.database().ref(`teams/${team}/saved-blocks/${name}`).set(xmlStr);  
      // Training mission saved code, saves with all teams?
      if (mission_id.startsWith("T")) {
        firebase.database().ref(`teams/team0/saved-blocks/${name}`).set(xmlStr); 
        firebase.database().ref(`teams/team1/saved-blocks/${name}`).set(xmlStr); 
        firebase.database().ref(`teams/team2/saved-blocks/${name}`).set(xmlStr);    
      }      
    }
 
    lastPushKey = dbref.push({ name: name, blocks : xmlStr, time: now, mission: mission_id, 
    missiondescription: missiondescription, robot: robot, player: player, team: team, changes: playerCodeChanges, runs: runCount, grid: grid, status: "" }).key;
    //console.log("lastPushKey is " + lastPushKey);
  }
}

// load code for targetName from firebase - not needed anymore
function getFromFirebase(targetName, loadCallback)
{
   // should we save these in archive or by team? 
     // if by team, then just a list of keys I guess? and can test if in
     let dbref = firebase.database().ref(`teams/${team}/saved-blocks`);
     let options = "";
     let items = [];
     dbref.once('value', function (snapshot) {
      // get from db
      let found = false;
      snapshot.forEach(function(childSnapshot) {
           let item = childSnapshot.val();
           let xml = item.blocks;
           let name = item.name;

           if (name != undefined && name == targetName) {
                found = true;
                loadCallback(xml);
                return;
           }
//      options += "<option value='"+ name + "'>" +  name + "</option>";
  //    items.push(item);          
    });
     if (!found) 
          loadCodeNotFoundCallback(targetName)
   });
}

function loadCodeNotFoundCallback(targetName) {
   // Not found 
   modalAlert("Code " + targetName + " not found!");
}

/*
function getToolboxElement() {
    const match = location.search.match(/toolbox=([^&]+)/);
    return document.getElementById('toolbox-' + (match ? match[1] : 'categories'));
}*/

function generateJavaScript() {
  var blocks = workspace.getAllBlocks();
  blocks.map( block => {
    console.log( block.type);
    console.log(Blockly.JavaScript[block.type]);
  });

    let code = Blockly.JavaScript.workspaceToCode(workspace);

    if (code.length > 0) {
        let lines = code.match(/[^\r\n]+/g);
        let cpLines = [...lines];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line == "(async function greenFlag() { await blockMessage('reset');") {
                if (i > 0) {
                    let lineBefore = lines[i - 1];

                    if (!lineBefore.startsWith('var')) {
                        cpLines.splice(i, 0, '})();');
                    }
                }
            }
        }
        let newCode = '';
        cpLines.forEach(line => {
            newCode += line + '\n';
        });
        return newCode += `
    } catch (error) {
        console.error(error);
    }
})();`;
    }
    return '';
}

/** Override Blockly.prompt() with custom implementation. */
Blockly.prompt = ((msg, defaultValue, callback) => {
    modalPrompt(msg, defaultValue, callback);    
});


/** Override Blockly.alert() with custom implementation. */
Blockly.alert = function(message, callback) {
  modalAlert(message);
};

/** Override Blockly.confirm() with custom implementation. */
Blockly.confirm = function(message, callback) {
   modalAlert(message); 
     // should really callback with Yes/No
};

function modalAlert(msg)
{
     var noop = function(){}; // do nothing for optional callbacks
     modalPrompt(msg,"noprompt",noop);
}
var modal = document.getElementById("myModal");
var close = document.getElementById("close");
// When the user clicks on close or enter, close the modal
close.onclick = function() {
        modal.style.display = "none";
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
}
    
function showSelectModal(msg, options, callback)
{
     let inputTag = document.getElementById("modalInput");
     let select = document.getElementById("modalSelect");
     select.style.display = "block";
     select.innerHTML = options;
     inputTag.style.display = "none";
     modal.style.display = "block";
     document.getElementById("msg").innerHTML = msg;
     var enter = document.getElementById("modalEnterButton");
     enter.onclick = function() {
            input = select.value;
            modal.style.display = "none";
            callback(input); // CALLBACK!
    }
     
}
function modalPrompt(msg, defaultValue, modalCallback)
{
     document.getElementById("msg").innerHTML = msg;  
     let inputTag = document.getElementById("modalInput");
     if (defaultValue == "noprompt")
          inputTag.style.display = "none";
     else {
          inputTag.style.display = "block";
          inputTag.value = defaultValue;
     }
     let select = document.getElementById("modalSelect");
     select.style.display = "none";
    // show modal
    modal.style.display = "block";

    // Modal code for buttons 
    
    var enter = document.getElementById("modalEnterButton");
    var input = document.getElementById("modalInput").value;
    var modalInput = "";

    enter.onclick = function() {
            input = document.getElementById("modalInput").value;
            modal.style.display = "none";
            modalCallback(input); // CALLBACK!
    }
}


// Procedures with a design workspace 
// inject a Blockly workspace into the modal for myblock procedures
var designFnWorkspace = Blockly.inject('designWorkspace',
            {media: 'media/', toolbox: toolbox,scrollbars: true}
);
var mutationRoot = null;

/* Listens to user typing in function name */
designFnWorkspace.addChangeListener(function() {
          if (mutationRoot) {
            mutationRoot.onChangeFn();
          }
        });

/* This is called by Blockly when "Make a Block" is clicked */
Blockly.Procedures.externalProcedureDefCallback = function (mutation, cb) {
      callback = cb;
      mutationRoot =  designFnWorkspace.newBlock('procedures_declaration');
      mutationRoot.domToMutation(mutation);
      mutationRoot.initSvg();
      mutationRoot.render(false);
      showFnWorkSpace(callback); // do we need callback?
}

/* This is called by the button after the function block is designed. It will put it into the toolbox */
function applyMutation() {
      var mutation = mutationRoot.mutationToDom(/* opt_generateShadows */ true)
     // console.log(mutation);
      callback(mutation);
      callback = null;
      mutationRoot = null;
      workspace.refreshToolboxSelection_();
    }


function showFnWorkSpace(callback)
{
     let designDiv = document.getElementById('designWorkspace');
      // display block doesn't seem to work with Blockly div
     designDiv.style.visibility = 'visible';
     designDiv.style.height = "100px";
     let editorActions = document.getElementById('editor-actions');
     editorActions.style.visibility = 'visible';
     
     // Can't seem to hide the top buttons
     hideTopButtons();
     var blocklyDiv = document.getElementById('blocklyDiv');
     blocklyDiv.style.height = "400px";
 
   // code for buttons 
    var param = document.getElementById("paramButton");
    var create = document.getElementById("createButton");
    var cancel = document.getElementById("cancelButton");

    param.onclick = function() {
          mutationRoot.addStringNumberExternal();
    }
    create.onclick = function() {
      applyMutation();     
      designFnWorkspace.clear();
      editorActions.style.visibility = 'hidden';
      designDiv.style.visibility = 'hidden';
      blocklyDiv.style.height = "100%";
      designDiv.style.height = "0px";
      showTopButtons();
    }
    cancel.onclick = function() {
      callback = null;
      mutationRoot = null;
      designFnWorkspace.clear();
      editorActions.style.visibility = 'hidden';
      designDiv.style.visibility = 'hidden';
      blocklyDiv.style.height = "100%";
      designDiv.style.height = "0px";
      showTopButtons();    
    }
}

function hideTopButtons()
{
     // Can't seem to hide the buttons - not sure why
     document.getElementById("topButtons").visibility = 'hidden';
     document.getElementById("greenflag-button").visibility = 'hidden';
     document.getElementById("stop-button").visibility = 'hidden';
     document.getElementById("save-button").visibility = 'hidden';
     document.getElementById("load-button").visibility = 'hidden';
}
function showTopButtons()
{
     // hiding enclosing div did not work
     document.getElementById("topButtons").visibility = 'visible';
     document.getElementById("greenflag-button").visibility = 'visible';
     document.getElementById("stop-button").visibility = 'visible';
     document.getElementById("save-button").visibility = 'hidden';
     document.getElementById("load-button").visibility = 'hidden';
}
var droneToolbox = 
    '<xml id="toolbox-categories" style="display: none">' +
    '<category name="%{BKY_CATEGORY_MOTION}" id="motion" colour="#4C97FF" secondaryColour="#3373CC">' +
      '<block type="drone_fly" id="drone_fly">' +
        '<value name="DISTANCE">' +
          '<shadow type="math_number">' +
            '<field name="NUM">1</field>' +
          '</shadow>' +
        '</value>' +
      '</block>' +
      '<block type="drone_fly_to_coords" id="drone_fly_to_coords">' +
        '<value name="X">' +
          '<shadow type="math_number">' +
            '<field name="NUM">0</field>' +
          '</shadow>' +
        '</value>' +
        '<value name="Y">' +
          '<shadow type="math_number">' +
            '<field name="NUM">0</field>' +
          '</shadow>' +
        '</value>' +
        '<value name="Z">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="drone_land" id="drone_land"></block>' +
    '<block type="motion_turn_right_left" id="motion_turn_right_left">' + '</block>' +
    '<block type="motion_turn" id="motion_turn">' +
      '<value name="ANGLE">' +
          '<shadow type="math_number">' +
            '<field name="NUM">90</field>' +
          '</shadow>' +
        '</value>' +
    '</block>' +
    '<block type="motion_pick_up" id="motion_pick_up"></block>' +
    '<block type="motion_deliver" id="motion_deliver"></block>' +
  '</category>' +
  '<category name="%{BKY_CATEGORY_EVENTS}" id="events" colour="#FFD500" secondaryColour="#CC9900">' +
    '<block type="event_whenflagclicked" id="event_whenflagclicked"></block>' +
  '</category>' +
  '<category name="%{BKY_CATEGORY_CONTROL}" id="control" colour="#FFAB19" secondaryColour="#CF8B17">' +
    '<block type="control_if" id="control_if"></block>' +
    '<block type="control_if_else" id="control_if_else"></block>' +
     '<block type="control_wait" id="control_wait">' +
      '<value name="DURATION">' +
        '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="control_repeat" id="control_repeat">' +
      '<value name="TIMES">' +
        '<shadow type="math_number">' +
          '<field name="NUM">5</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="control_repeat_until" id="control_repeat_until"></block>' +
    // '<block type="control_while" id="control_while"></block>' +
  '</category>' +
  '<category name="%{BKY_CATEGORY_SENSING}" id="sensing" colour="#4CBFE6" secondaryColour="#2E8EB8">' +
    '<block type="at_object" id="at_object"></block>' +
    '<block type="at_house" id="at_house">' + 
       '<value name="HOUSENUMBER">' +
          '<shadow type="math_number">' +
            '<field name="NUM">1</field>' +
          '</shadow>' +
        '</value>' +
     '</block>' +
     '<block type="distance" id="distance"></block>' +
  '</category>' +
  '<category name="%{BKY_CATEGORY_OPERATORS}" id="operators" colour="#40BF4A" secondaryColour="#389438">' +
    '<block type="operator_add" id="operator_add">' +
      '<value name="NUM1">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="NUM2">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_subtract" id="operator_subtract">' +
      '<value name="NUM1">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="NUM2">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_multiply" id="operator_multiply">' +
      '<value name="NUM1">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="NUM2">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_divide" id="operator_divide">' +
      '<value name="NUM1">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="NUM2">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_random" id="operator_random">' +
      '<value name="FROM">' +
        '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="TO">' +
        '<shadow type="math_number">' +
          '<field name="NUM">10</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_lt" id="operator_lt">' +
      '<value name="OPERAND1">' +
        '<shadow type="text">' +
          '<field name="TEXT">0</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="OPERAND2">' +
        '<shadow type="text">' +
          '<field name="TEXT">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_equals" id="operator_equals">' +
      '<value name="OPERAND1">' +
        '<shadow type="text">' +
          '<field name="TEXT">0</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="OPERAND2">' +
        '<shadow type="text">' +
          '<field name="TEXT">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_gt" id="operator_gt">' +
      '<value name="OPERAND1">' +
        '<shadow type="text">' +
          '<field name="TEXT">0</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="OPERAND2">' +
        '<shadow type="text">' +
          '<field name="TEXT">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_and" id="operator_and"></block>' +
    '<block type="operator_or" id="operator_or"></block>' +
    '<block type="operator_not" id="operator_not"></block>' +
  '</category>' +
  '<category name="%{BKY_CATEGORY_VARIABLES}" id="variables" colour="#FF8C1A" secondaryColour="#DB6E00" custom="VARIABLE">' +
  '</category>' +
'</xml>';
