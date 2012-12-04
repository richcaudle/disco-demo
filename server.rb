require 'rubygems'
require 'sinatra/base'
require 'yaml'
require 'pusher'
require 'json'

class Server < Sinatra::Base

	# hash for saving positions of dancers
	positions = {}

	# set Pusher configuration
	set :public_folder, Proc.new { File.join(root, "public") }
	config = YAML.load_file('./config.yml')

	Pusher.app_id = config['pusher']['app_id']
	Pusher.key = config['pusher']['app_key']
	Pusher.secret = config['pusher']['app_secret']

	# main view action
	get '/' do
		@app_key = config['pusher']['app_key']
		erb :index
	end

	# authentication action
	post '/auth' do
		content_type :json

		channelName = params[:channel_name]

		if params[:channel_name].match(/^presence-/)

			#If a presence channel
			response = Pusher[params[:channel_name]].authenticate(params[:socket_id], {
		        :user_id => params[:socket_id],
		        :user_info => {
		          :name => params[:username]
		        }
		      })
		    
		else

			# If a private channel
			response = Pusher[params[:channel_name]].authenticate(params[:socket_id])

		end

      	response.to_json

	end

	post '/move' do
		positions[params[:id]] = params[:left]
		Pusher['private-dancers'].trigger!('move', {:id => params[:id], :left => params[:left]}, params[:socketId])
	end

	get '/positions' do
		positions.to_json
	end

	run! if app_file == $0

end