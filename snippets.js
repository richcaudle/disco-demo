/* -------- CONNECT TO PUSHER ------------- */

// Open connection to Pusher, specifying app key
var pusher = new Pusher(PUSHER_CONFIG.APP_KEY);

// Set up Pusher logging to console
Pusher.log = function (message) {
    if (window.console && window.console.log) {
        window.console.log(message);
    }
};

// Set callback for authentication
Pusher.channel_auth_endpoint = "/auth?username=" + username;

// Get socket ID on connection success
pusher.connection.bind('connected', function () {
    socketId = pusher.connection.socket_id;
    memberId = socketId.replace(".", "");
    console.log("Member ID: " + memberId);
});

/* -------- SUBSCRIBE TO CHANNEL ------------- */

movesChannel = pusher.subscribe('private-dancers');

movesChannel.bind('client-move', function(data) {
    moveDancer(data.id, data.left);
});

// { "id": "23863605546", "left": 300 }

/* -------- PRESENCE ------------------------- */

// Presence channel
presenceChannel = pusher.subscribe('presence-dancers');

presenceChannel.bind('pusher:subscription_succeeded', function () {
    getCurrentPositions();
});

presenceChannel.bind('pusher:member_added', function (member) {
    addDancer(member.id, member.info.name);
});

presenceChannel.bind('pusher:member_removed', function (member) {
    removeDancer(member.id);
});


/* -------- PUBLISH (server) ------------------ */

$.post('/move', { id: id, left: left, socketId: socketId });


/* -------- PUBLISH (client) -------------------- */

movesChannel.trigger('client-move', { "id": id, "left": left } );
