document.addEventListener('DOMContentLoaded', () => {

    if (window.vuplex) {
        window.addEventListener('vuplexready', window.vuplex.postMessage("REQUEST_FOR_INFO"));

        window.vuplex.addEventListener('message', function messageEndListener(event) {
            let json = JSON.parse(event.data);
            console.log(json);
            document.querySelector('#hairColor').jscolor.value = json.HairColor;
            document.querySelector('#skinColor').jscolor.value = json.SkinColor;
            document.querySelector('#pantsColor').jscolor.value = json.pantsColor;
        });
    }

    document.getElementById('nextAvatarButton').addEventListener('click', (e) => {
        e.preventDefault();
        window.vuplex.postMessage({ action: 'avatar', value: 'next'});
    });
    document.getElementById('prevAvatarButton').addEventListener('click', (e) => {
        e.preventDefault();
        window.vuplex.postMessage({ action: 'avatar', value: 'prev'});
    });

    document.getElementById('nextHairButton').addEventListener('click', (e) => {
        e.preventDefault();
        window.vuplex.postMessage({ action: 'hair', value: 'next'});
    });
    document.getElementById('prevHairButton').addEventListener('click', (e) => {
        e.preventDefault();
        window.vuplex.postMessage({ action: 'hair', value: 'prev'});
    });
    
    // $('#loginButton').click(() => {
    //     let displayName = $('#displayNameInput').val();
    //     let hairColor = $('#hairColorInput').val();
    //     let skinColor = $('#skinColorInput').val();
    //     let shirtColor = $('#shirtColorInput').val();
    //     let pantsColor = $('#pantsColorInput').val();

    //     var jsonObj = {
    //         DisplayName: displayName,
    //         ShirtColor: shirtColor,
    //         PantsColor: pantsColor
    //     }
    //     window.vuplex.postMessage(jsonObj);
    // });

}, false);

function handleColorChange(picker, target) {
    window.vuplex.postMessage({ action: target, value: picker.toHEXString()});
}