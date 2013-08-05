require 'oauth'

class TwitterApp

	@@access_token = 0

	# Get access token for Twitter API
	def self.prepare_access_token(consumer_key, consumer_secret, oauth_token, oauth_token_secret)
	  
	  consumer = OAuth::Consumer.new(consumer_key, consumer_secret,
	    { :site => "http://api.twitter.com",
	      :scheme => :header
	    })
	  
	  token_hash = { :oauth_token => oauth_token,
	                 :oauth_token_secret => oauth_token_secret
	               }
	  @@access_token = OAuth::AccessToken.from_hash(consumer, token_hash )

	end

	def self.get_profile_image(screen_name)
		
		img_file = "public/profile_images/#{screen_name}.png"

		if !(File.exist?(img_file))		
			response = @@access_token.request(:get, "https://api.twitter.com/1.1/users/show.json?screen_name=#{screen_name}") 
			profile = JSON.parse(response.body)

			File.open(img_file, "w") do |f|
				img_response = @@access_token.request(:get, profile['profile_image_url'])
				f.syswrite img_response.body
			end
		end
		
 	end

end