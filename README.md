# Pusher Disco Demo (Warning - this is very silly!)

This simple example code illustrates how to create a disco using presence and private channels in [Pusher](http://pusher.com). 

In this demo, users can join the room by navigating to the main page on their desktop or mobile browser. They can then click in the room to move around. The dancers in the room and their positions are syncronised for all users using Pusher.

You can see this demo in action here [http://pusher-disco.herokuapp.com](http://pusher-disco.herokuapp.com).

The demo is written with Sinatra (a Ruby framework). 

To run the demo locally:
* Clone the source to your computer
* Complete the settings within config.yml for a valid Pusher app
* Open a command prompt / terminal and change to the directory where the source code has been cloned to
* Run _ruby server.rb_
* Navigate to the web page on your desktop or mobile browser