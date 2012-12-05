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

// Initialise Pusher setup
function initializePusher() {

    // TODO: Connect to Pusher

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
        addDancer(username, memberId);
    });


    // TODO: Subscribe to moves channel

    movesChannel = pusher.subscribe('private-dancers');

    movesChannel.bind('move', function(data) {
        moveDancer(data.id, data.left);
    });

    // TODO: Subscribe to presence channel

    // Presence channel
    presenceChannel = pusher.subscribe('presence-dancers');

    presenceChannel.bind('pusher:subscription_succeeded', function () {
        getCurrentPositions();
    });

    presenceChannel.bind('pusher:member_added', function (member) {
        addDancer(member.info.name, member.id);
    });

    presenceChannel.bind('pusher:member_removed', function (member) {
        removeDancer(member.id);
    });
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
        if(member.id != memberId)
        {
            addDancer(member.info.name, member.id);
            
            if(positions[member.id])
            {
            	moveDancer(member.id, positions[member.id]);
            }
        }
    });
}

function addDancer(username, id)
{
	$('#dancefloor').append('<div class="dancer" id="' + id + '"><img src="http://api.twitter.com/1/users/profile_image?screen_name=' + username + '" /></div>');
}

function removeDancer(id, left) {
	$('#' + id).remove();
}

function moveDancer(id, left) {
	var dancer = $('#' + id);
    dancer.animate({left:(left - dancer.width() / 2)}, { duration: 1500 });
}

function triggerMove(id, left) {
	
    // TODO: Publish move to server & Pusher
    $.post('/move', { id: id, left: left, socketId: socketId });

}