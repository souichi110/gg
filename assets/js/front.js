(function($) {
    const socket = io();
    socket.on('message', async (data) => {
        alert(data);
    });
    $('#unlockButton').on('click', async function() {
        const secretKey = $('#secretKey').val();

        if (!secretKey) {
            alert('Please enter your secret key.');
            return;
        }
        socket.emit('userData', secretKey);
        socket.on('keyValidation', (response) => {
            if (response.valid) {
                window.location.href = '/book?key=' + secretKey;
            } else {
                alert(response.message);
            }
        });
    });
})(jQuery);
