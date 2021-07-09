// Script to show saved blocks from Firebase

var workspace = null;

function start() {
    var toolbox = allBlocks;

    // Create main workspace.
    workspace = Blockly.inject('blocklyDiv', {
        media: 'media/',
        readOnly: true,
        scrollbars: true,
        zoom: {
            controls: true,
            wheel: true,
            startScale: .85, // .75 initially
            maxScale: 4,
            minScale: 0.25,
            scaleSpeed: 1.1
        },
        colours: {
            fieldShadow: 'rgba(255, 255, 255, 0.3)',
            dragShadowOpacity: 0.6
        }
    });
    
    // retrieve code from Firebase and build menus
    getDataBuildMenus();
}

var teamMenu = document.getElementById("team");    
var playerMenu = document.getElementById("player");
var missionMenu = document.getElementById("mission"); 
var dateMenu = document.getElementById("date"); 
var timeMenu = document.getElementById("time"); 
var stats = document.getElementById("stats"); 


var items = [];
var filtereditems = [];
var savedData = {};

// Retrieve from Firebase
// We should also export json data and just work with that once workshop is done
let timeMenuAll = ""; 
function getDataBuildMenus()
{   
    let dbref = firebase.database().ref("archive"); 
    dbref.once('value', function (snapshot) {
      // get from db
      snapshot.forEach(function(childSnapshot) {
          let item = childSnapshot.val(); 
          let key = childSnapshot.key;
          savedData[key] = item;
          item.key = key;
          items.push(item);        
          let datetime = item.time;  
          let tindex = datetime.indexOf("202")+4;
          let time = datetime.substring(tindex,datetime.indexOf("GMT"));
           // use key as unique value
          let timeoption = "<option value='"+ key + "'>" + time + "</option>";
          timeMenuAll += timeoption; // revert to this when all is chosen 
      });
      filtereditems = items;
      populateMenus(items);    
   });   
}


document.getElementById("reset").onclick = function() {
     filtereditems = items;
     populateMenus(items); // back to original
};
// take into account multiple filters
document.getElementById("show").onclick = function() {
     //let targetDate = dateMenu.value; // date is now fixed
     let targetTeam = teamMenu.value; 
     let targetPlayer = playerMenu.value; 
     let targetMission = missionMenu.value; 

     filteredItems = items;
     //if (targetDate != "all")
       // filteredItems = filteredItems.filter(item => item.time.includes(targetDate));
     if (targetTeam != "all")
        filteredItems = filteredItems.filter(item => item.team === targetTeam);
     if (targetMission != "all")
        filteredItems = filteredItems.filter(item => item.mission === targetMission);
     if (targetPlayer != "all")
        filteredItems = filteredItems.filter(item => item.player === targetPlayer);
   
     //console.log(filteredItems);
     populateMenus(filteredItems);
     
     console.log("Showing " + targetTeam + " " + targetPlayer + " " + targetMission + " ");
     // show the first block by forcing an onchange
     if (timeMenu.length > 0) 
            timeMenu.dispatchEvent(new Event('change'));  
     //dateMenu.value = targetDate;
     teamMenu.value = targetTeam;
     playerMenu.value = targetPlayer;
     missionMenu.value = targetMission;
};

function populateMenus(menuitems, except = null)
{
    let missions = [];
    let teams = [];
    let players = [];
    //let dates = [];
    stats.innerHTML = "";
    //if (except != "team" && teamMenu.value == "all") // redo teamMenu 
        teamMenu.innerHTML = "<option value='all'>All</option>";
    //if (except != "player"  && playerMenu.value == "all") 
        playerMenu.innerHTML = "<option value='all'>All</option>";
    //if (except != "mission"  && missionMenu.value == "all")
        missionMenu.innerHTML = "<option value='all'>All</option>"; 
//    if (except != "date"  && dateMenu.value == "all")
        //dateMenu.innerHTML = "<option value='all'>All</option>";
    timeMenu.innerHTML = "";
   
     // change to showing only 1 day at a time in menus
     
     let today = new Date(document.getElementById('date').value + "T00:00:00"); 
     let targetDate = today.toString().substring(0,15); 
     console.log(targetDate);
     // Filter menuitems by the target date (default today)
     menuitems = menuitems.filter(item => item.time.includes(targetDate));
     
    for(let i=0; i < menuitems.length; i++){
        let item = menuitems[i];
 
        // no duplicates
        if (except != "team" && item.team != undefined && item.team != "" && !(teams.includes(item.team))) {
           teams.push(item.team);
           let teamOption = "<option value='"+ item.team + "'>" + item.team + "</option>"; 
           teamMenu.innerHTML += teamOption;
        }
        if (except != "player" && item.player != undefined && !(players.includes(item.player))) {    
            players.push(item.player);
           if (item.player)
             playerMenu.innerHTML += "<option value='"+ item.player + "'>" + item.player + "</option>";
        }
        if (except != "mission" && item.mission != undefined && !(missions.includes(item.mission))) {       
            missions.push(item.mission);
           let missionOption =  "<option value='"+ item.mission + "'>" + item.mission + "</option>"; 
           missionMenu.innerHTML += missionOption;
        }
         
        let datetime = item.time;  
        let tindex = datetime.indexOf("202")+4;
        let date = datetime.substring(0,tindex);
        let time = datetime.substring(tindex,datetime.indexOf("GMT"));
        let timeoption = "<option value='"+ item.key + "'>" + time + "</option>";
        timeMenu.innerHTML += timeoption;
        timeMenuAll += timeoption; 
        /*if (
             //except != "date" && 
             !(dates.includes(date))) { 
            dates.push(date);
            let dateoption = "<option value='"+ date + "'>" + date + "</option>";           
           dateMenu.innerHTML += dateoption;
        }*/
    }
     // show the first block by forcing an onchange
     if (timeMenu.length > 0) 
            timeMenu.dispatchEvent(new Event('change')); 
}


// if new date chosen, just call populate menus again which will read in the new date and filter
date.onchange = function() {
    filtereditems = items;
     populateMenus(items);
}

// when time in menu is selected, show blocks 
timeMenu.onchange = function() {
      let target = document.getElementById("time").value;
      let item = savedData[target];
          //filtereditems.find(block => block.time.includes(target));
      let xml = item.blocks;
      // console.log(item);
         // put in workspace
      let dom = Blockly.Xml.textToDom(xml);
       Blockly.mainWorkspace.clear();
       Blockly.Xml.domToWorkspace(dom,workspace);
        //Blockly.Xml.appendDomToWorkspace(dom, workspace);
       updateStats(item);
} 



document.getElementById("next").onclick = function() {
       let timeMenu = document.getElementById("time");
       let i = timeMenu.selectedIndex;
       if (i < timeMenu.length - 1) 
       {
          i++;
          timeMenu.selectedIndex = i;
          let target = timeMenu.value;
          let item = savedData[target];
              //filtereditems.find(block => block.time === target);
          let xml = item.blocks;
          // put in workspace
          let dom = Blockly.Xml.textToDom(xml);
          Blockly.mainWorkspace.clear();
          Blockly.Xml.domToWorkspace(dom,workspace);
          updateStats(item);
    }
  }
document.getElementById("prev").onclick = function() {
      let timeMenu = document.getElementById("time");
      let i = timeMenu.selectedIndex;
      if (i > 0)
      {
          i--;
          timeMenu.selectedIndex = i;
          let target = timeMenu.value;
          let item = savedData[target];
           //filtereditems.find(block => block.time === target);
          let xml = item.blocks;
          // put in workspace
          let dom = Blockly.Xml.textToDom(xml);
          Blockly.mainWorkspace.clear();
          Blockly.Xml.domToWorkspace(dom,workspace);
          updateStats(item);
      }
  }


function updateStats(item)
{
      stats.innerHTML = "Team: " + item.team + "<br>Player: " + item.player + "<br>Mission: " + item.mission +
           "<br>Date: " + item.time + "<br>Grid: " + item.grid + 
           "<br>Number of runs: " + item.runs + "<br>Number of code changes:" + item.changes ;
      if (item.name != "")
           stats.innerHTML += "<br>Code saved as " + item.name;
       if (item.blocks.includes("repeat"))
           stats.innerHTML += "<br>Loop used";
       if (item.status == "finished")
           stats.innerHTML += "<br>Status: mission finished";
       else
           stats.innerHTML += "<br>Status: not yet finished";  
       stats.innerHTML += 
            "<br>Mission Description: " + item.missiondescription;
}

var allBlocks = '<xml id="toolbox-categories" style="display: none">' +
  '<category name="%{BKY_CATEGORY_MOTION}" id="motion" colour="#4C97FF" secondaryColour="#3373CC">' +
    '<block type="motion_drive_forward_reverse" id="motion_drive_forward_reverse">' +
      '<value name="DISTANCE">' +
          '<shadow type="math_number">' +
            '<field name="NUM">1</field>' +
          '</shadow>' +
        '</value>' +
    '</block>' +
    '<block type="motion_turn_right_left" id="motion_turn_right_left">' + '</block>' +
    '<block type="motion_turn" id="motion_turn">' +
      '<value name="ANGLE">' +
          '<shadow type="math_number">' +
            '<field name="NUM">90</field>' +
          '</shadow>' +
        '</value>' +
    '</block>' +
     '<block type="drone_fly" id="drone_fly">' +
    '<value name="DISTANCE">' +
        '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
  '</block>' +
  '<block type="drone_land" id="drone_land"></block>' +
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
  '</block>' +
    // '<block type="motion_stop" id="motion_stop"></block>' +
    '<block type="motion_follow_curb_for" id="motion_follow_curb_for">' +
        '<value name="DISTANCE">' +
          '<shadow type="math_number">' +
            '<field name="NUM">1</field>' +
          '</shadow>' +
        '</value>' +
    '</block>' +
    '<block type="motion_follow_curb" id="motion_follow_curb"></block>' +
    '<block type="motion_pick_up" id="motion_pick_up"></block>' +
    '<block type="motion_put_down" id="motion_put_down"></block>' +
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
   //  '<category name="Functions" custom="PROCEDURE" id="functions" ></category>' + // colour="#fc5e80" gives error
  '</xml>';
