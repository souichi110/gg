(function($) {
    const socket = io();

    // Listen for messages from the server
    socket.on('message', async (data) => {
        alert(data);
    });
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    // Handle button click for submitting the secret key
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
