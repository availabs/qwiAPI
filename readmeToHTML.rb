#!/usr/bin/env ruby
require 'github/markup'

indexTemplate = File.read('./index.template.html')

docHTML = GitHub::Markup.render('README.markdown', File.read('./README.md'))

docsSectionBegin = %{
<div class="col-md-9" role="main">
  <div class="bs-docs-section">
}

docsSectionEnd = %{
  </div>
</div>
}



docHTML = docHTML.gsub(/<code>JSON|<code>BASH/, "<pre class=\"code\">")
docHTML = docHTML.gsub(/<\/code><!--END_CODE-->/, "<\/pre>")
docHTML = docHTML.gsub(/<!--__BEGIN_DOCS_SECTION__-->/, docsSectionBegin)
docHTML = docHTML.gsub(/<!--__END_DOCS_SECTION__-->/, docsSectionEnd)
docHTML = docHTML.gsub(/^/, "            ")


indexHTML = indexTemplate.gsub(/<!--__GENERATED_DOCUMENTATION_INSERTED_HERE___-->/, docHTML)


File.write('static/index.html', indexHTML)
