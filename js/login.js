$(() => {
    window.addEventListener('vuplexready', window.vuplex.postMessage("REQUEST_FOR_INFO"));

    window.vuplex.addEventListener('message', function messageEndListener(event) {
        let json = JSON.parse(event.data);
        $('#displayNameInput').val(json.DisplayName);
        $('#shirtColorInput').val(json.ShirtColor);
        $('#pantsColorInput').val(json.PantsColor);
    });

    $('#loginButton').click(() => {
        let displayName = $('#displayNameInput').val();
        let shirtColor = $('#shirtColorInput').val();
        let pantsColor = $('#pantsColorInput').val();

        var jsonObj = {
            DisplayName: displayName,
            ShirtColor: shirtColor,
            PantsColor: pantsColor
        }
        window.vuplex.postMessage(jsonObj);
    });
});