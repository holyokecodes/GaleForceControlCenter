if (window.vuplex) {
    // request player and team info
    window.vuplex.postMessage({ action: "info", value: "true" });
} else {
    // The window.vuplex object hasn't been initialized yet because the page is still
    // loading, so add an event listener to send the message once it's initialized.
    window.addEventListener('vuplexready', window.vuplex.postMessage({ action: "info", value: "true" }));
}

// Utils to talk between JS and Unity
function blockMessage(action, value) {
    console.log(`Block -> action:${action} value:${value}`);
    window.addEventListener('vuplexready', window.vuplex.postMessage({ action: action, value: value }));
    return new Promise((resolve, reject) => {
        window.vuplex.addEventListener('message', function messageEndListener(event) {
            let json = JSON.parse(event.data);
            // console.log(JSON.stringify(json));
            if (json.action == 'exception') {
                window.vuplex.removeEventListener('message', messageEndListener);
                reject('exception');
            } else if (json.action == action) {
                // An action with no parameters has a null for value. 
                // This gets passed back as an empty string. 
                // Perhaps we could just ignore value altogether? 
                // Or maybe better if each block has a unique id.
                if (value == null || json.value == value) {
                    window.vuplex.removeEventListener('message', messageEndListener);
                    resolve(json.value);
                }
            }
        });
    });
}
// Listen to all messages
window.vuplex.addEventListener('message', function messageEndListener(event) {
    data = JSON.parse(event.data);

    // log all actions
    // if (!Array.isArray(data)) {
    //     console.log(data.action, data.value);
    // }

    if (Array.isArray(data)) {
        // If it is an array, it is a list of things the sensor sees.
        // TODO: maybe better to pass an object with a label
        sensor = data;
    } else if (data.action == 'player') {
        player = data.value;
        console.log("name player: ", player);
    } else if (data.action == 'team') {
        team = data.value;
        console.log("assigned to team: ", team);
        workspace.addChangeListener(syncMissions);
        subscribeToMissions();
      } else if (data.action == 'robot') {
        var new_robot = data.value;
        if (robot !== new_robot) {
            // It's a new robot, set the appropriate toolbox
            robot = new_robot;
            if (robot.includes("Drone")) {
                workspace.updateToolbox(droneToolbox);
            } else {
                workspace.updateToolbox(Blockly.Blocks.defaultToolbox);
            }
        }
    } else if (data.action == 'mission') {
        let last_mission_id = mission_id;
        mission_id = data.value;
        if (mission_id != last_mission_id) {
            // reset counter of code changes
            playerCodeChanges = 0;
            runCount = 0;
            getInitialCode();  
        }
        // For the training missions, sync all
        // or should we just listen when joining team?
        // if (mission_id.startsWith("T")) syncTrainingMission();
    } else if (data.action == "missiondescription") {
        missiondescription = data.value;
    } else if (data.action == "grid") {
        grid = data.value;   
    } else if (data.action == "success") {
        // post to firebase for success:true 
        if (data.value == "true" && lastPushKey != undefined) {
            let dbref = firebase.database().ref("archive").child(lastPushKey);
            dbref.update({status: "finished" });
        }      
    }
});
