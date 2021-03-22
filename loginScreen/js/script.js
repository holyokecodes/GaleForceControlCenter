document.addEventListener('DOMContentLoaded', () => {

    if (window.vuplex) {
        window.addEventListener('vuplexready', window.vuplex.postMessage("REQUEST_FOR_INFO"));

        window.vuplex.addEventListener('message', function messageEndListener(event) {
            let json = JSON.parse(event.data);
            $('#displayNameInput').val(json.DisplayName);
            $('#shirtColorInput').val(json.ShirtColor);
            $('#pantsColorInput').val(json.PantsColor);
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

    // $('colorPicker').on('change', (picker) => {
    //     window.vuplex.postMessage('')
    // });
    
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

function handleColorChange(target, color) {
    window.vuplex.postMessage({ action: target, value: color});
}