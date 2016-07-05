#!/usr/bin/env ruby
require 'github/markup'

indexHTML = GitHub::Markup.render('README.markdown', File.read('./README.md'))

indexHTML = indexHTML.gsub(/<code>JSON/, "<pre class=\"code\">")
indexHTML = indexHTML.gsub(/<\/code>/, "<\/pre>")

File.write('static/index.html', indexHTML)
