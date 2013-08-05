var username;
var socketId;
var memberId;
var movesChannel;
var presenceChannel;
var positions;

// On document ready, init UI
$(function () {
    initializeUI();
});

// Sets up UI controls
function initializeUI() {

    $('#dancefloor').click(function(e)
    {
        moveDancer(memberId, e.pageX);
        triggerMove(memberId, e.pageX);
    });

    // Set up 'enter name' dialog and open it
    $('#nameDialog').dialog({
        autoOpen: true,
        width: 400,
        modal: true,
        position: {
            my: "center",
            at: "center",
            of: "#dancefloor"
        },
        buttons: {
            "Ok": function () {

                var tempUsername = $('#username').val();

                // Check username is not blank
                if (tempUsername.trim() != '') {
                    username = tempUsername;
                    username = username.replace("@", "");

                    $('#title').empty().append('Welcome ' + username);
                    $(this).dialog("close");

                    initializePusher();
                }
                else
                    return false;
            }
        }
    });
}

// TODO: Initialise Pusher setup
function initializePusher() {
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

    movesChannel = pusher.subscribe('private-dancers');

    movesChannel.bind('client-move', function(data) {
        moveDancer(data.id, data.left);
    });

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
}

// TODO: Publish move to server & Pusher
function triggerMove(id, left) {
    movesChannel.trigger('client-move', { "id": id, "left": left } );
}

function getCurrentPositions()
{
	// Get dancer positions
	$.get('/positions', function(data) {
		positions = jQuery.parseJSON(data);
		console.log('Positions: ' + positions);
		addAllDancers();
	});
}

function addAllDancers()
{
	presenceChannel.members.each(function (member) {
        addDancer(member.id, member.info.name);
            
        if(positions[member.id])
        {
            moveDancer(member.id, positions[member.id]);
        }
    });
}

function addDancer(id, username)
{
	$('#dancefloor').append('<div class="dancer" id="' + id + '"><img src="/profile_images/' + username + '.png" /></div>');
}

function removeDancer(id, left) {
	$('#' + id).remove();
}

function moveDancer(id, left) {
	var dancer = $('#' + id);
    dancer.animate({left:(left - dancer.width() / 2)}, { duration: 1500 });
}
