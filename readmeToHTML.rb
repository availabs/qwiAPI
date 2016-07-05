#!/usr/bin/env ruby
require 'github/markup'

indexTemplate = File.read('./index.template.html')

docHTML = GitHub::Markup.render('README.markdown', File.read('./README.md'))

docHTML = docHTML.gsub(/<code>JSON|<code>/, "<pre class=\"code\">")
docHTML = docHTML.gsub(/<\/code>/, "<\/pre>")

indexHTML = indexTemplate.gsub(/<!--__GENERATED_DOCUMENTATION_INSERTED_HERE___-->/, docHTML)

File.write('static/index.html', indexHTML)
