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

        console.log('Submitted key:', secretKey);

        // Emit user data with the secret key
        socket.emit('userData', secretKey);
        await sleep(1000); // Pause for 5 seconds
        window.location.href = '/book?key=' + secretKey
    });
})(jQuery);
