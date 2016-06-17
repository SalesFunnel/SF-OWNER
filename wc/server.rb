require 'webrick'
require 'json'

# default port to 3033 or overwrite with PORT variable by running
# $ PORT=3031 ruby server.rb
port = ENV['PORT'] ? ENV['PORT'].to_i : 3034

puts 'SalesFunnel Owner table engine start...'
puts "Server started: http://localhost:#{port}/"

root = File.expand_path './public'
server = WEBrick::HTTPServer.new Port: port, DocumentRoot: root

server.mount_proc '/api/reports' do |req, res|
  cycle_times = JSON.parse(File.read('./owner.json', encoding: 'UTF-8'))

  if req.request_method == 'POST'
    # Assume it's well formed
    cycle_time = { id: (Time.now.to_f * 1000).to_i }
    req.query.each do |key, value|
      cycle_time[key] = value.force_encoding('UTF-8') unless key == 'id'
    end
    cycle_times << cycle_time
    File.write(
        './owner.json',
        JSON.pretty_generate(cycle_times, indent: '    '),
        encoding: 'UTF-8'
    )
  end

  # always return json
  res['Content-Type'] = 'application/json'
  res['Cache-Control'] = 'no-cache'
  res['Access-Control-Allow-Origin'] = '*'
  res.body = JSON.generate(cycle_times)
end

trap('INT') { server.shutdown }

server.start
