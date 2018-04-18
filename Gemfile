source 'https://rubygems.org'

ruby '2.4.2'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

gem 'rails',                   '5.1.4'
gem 'font-awesome-rails'
gem 'haml'
gem 'bcrypt'                  
gem 'faker'
gem 'carrierwave'
gem 'mini_magick'
gem 'fog'
gem 'will_paginate'
gem 'bootstrap-will_paginate'
gem 'bootstrap', '~> 4.0.0'
gem 'puma'
gem 'sass-rails'
gem 'uglifier'
gem 'coffee-rails'
gem 'jquery-rails'
gem 'turbolinks'
gem 'jbuilder'
gem 'redis'
# When mail is sent from your application, Letter Opener will open a preview in the browser instead of sending.
gem "letter_opener"
# for campaign monitor
gem 'createsend'
gem 'hashie'
gem 'httparty'
gem 'json'
gem 'rack-tracker'

gem "pry"

group :development, :test do
  gem 'sqlite3', '1.3.12'
  gem 'byebug',  '9.0.0', platform: :mri
end

group :development do
  gem 'web-console',           '3.1.1'
  gem 'listen',                '3.0.8'
  gem 'spring',                '1.7.2'
  gem 'spring-watcher-listen', '2.0.0'
end

group :test do
  gem 'rails-controller-testing', '0.1.1'
  gem 'minitest-reporters',       '1.1.9'
  gem 'guard',                    '2.13.0'
  gem 'guard-minitest',           '2.4.4'
end

group :production do
  gem 'pg',   '0.18.4'
  gem 'heroku-deflater'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
