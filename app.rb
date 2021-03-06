require 'sinatra/base'
require 'sinatra/config_file'
require 'json'
require 'mysql2'
require 'gon-sinatra'
require root_path('helpers/assets')

class App < Sinatra::Base
  register Sinatra::ConfigFile
  register Gon::Sinatra
  helpers Helpers::Assets

  config_file 'config/app_config.yml'
  NOMBRES_DEFAULT = ["Emilia", "Benjamin"]
  YEAR_DEFAULT = 2015

  configure do
    set :views, root_path('views')
    set :public_folder, root_path('public')
    set :static_cache_control, [:public, max_age: 60 * 60 * 24]
    set :environment, settings.environment

    set :app_domain, settings.development? ? '127.0.0.1:9393' : "#{settings.host}"

    enable :static
  end

  configure :production, :development do
    enable :logging
  end

  not_found do
    erb :'not_found.html'
  end

  get %r{/(?:nombre/([^/]{2,120})(?:/(\d{4,4}))?)?} do |main_name, year|
    if settings.app_domain === request.env['HTTP_HOST']
      cache_control :public, :must_revalidate, max_age: 60 * 60 * 24
      
      # Otros nombres para comparar / Sacamos whitespace
      other_names = (params[:others] || '').split(',').map(&:strip)

      # Asignar default de nombres
      if main_name
        default = false
        # Sacamos espacios
        main_name = URI.decode(main_name)
      else
        default = true
        main_name = NOMBRES_DEFAULT[0]
        other_names = [NOMBRES_DEFAULT[1]]
      end

      # Force encoding utf-8 para server thin
      main_name.force_encoding('utf-8')

      # Asignar default de anio
      year = year ? year.to_i : YEAR_DEFAULT

      # Buscar data de todos los nombres (el principal y el/los otros)
      main_name_data = Nombre.new(main_name).get_all
      other_names_data = []
      other_names.each do |other_name|
        other_name.force_encoding('utf-8')
        other_names_data << Nombre.new(other_name).get_all
      end

      # Disponibilidar variables para el JS usando la gema gon-sinatra
      gon.main_name = main_name
      gon.main_name_data = main_name_data
      gon.other_names = other_names
      gon.other_names_data = other_names_data
      gon.year = year

      erb(:'index.html', layout: :'layout.html', locals: {
        default: default,
        main_name: main_name,
        other_names: other_names,
        year: year
      })
    else
      redirect("http://#{settings.host}:#{settings.port}", 301)
    end
  end
end

require_relative('models/nombre.rb')
