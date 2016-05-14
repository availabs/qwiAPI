#WORK IN PROGRESS

##_NOT_ READY FOR PRODUCTION

The PostgresSQL database encoding must be set to UTF8. If you use the included scripts, or the Docker containers, this is handled for you.

Data loading is done through the Node server routes. Look in app.js until they are documented.

Configuration via env variables. Look in config/ to see the defaults. Note: if switching between native Node and/or Postgres and Docker containers of either or both, you may need to update the configs. Documentation to come. For now, read the comments in the config files.

###Code in __MAJOR__ need of a refactor. Same is true of the file structure of the app.###

Needs try/catch blocks throughout codebase. Currently very brittle.

Index building route on the way.

Example Queries:
http://localhost:10101/data/?fields=emp



Notes on the API

  Years: Years are always included in the leaf data object as 'year'
    In queries:
      If no year provided,
        year is included in the leaf data object as 'year2'
      If a year is provided,
        it occurs as a key in the response object's inner nodes, as well as a key in the leaf data object
      If two years are included,
        it gives you the inclusive range for the two years.
      If more than two years are given, the response includes data for only those years.
        (Note, to get data for only two years, repeat one of the years--eg: yr199020002000)

  Aggregation categories and indicators

    Table columns can be divided into two groups: queryable aggregation columns and indicator/status_flag values.

      * Queryable columns:
          When using this API, the queryable columns can be specified in the dynamic path, or
            as a field in the query portion of the request.
          The key difference is that, unless `flat=true` is included in query of the request,
            columns including in the path are used to generate the hierarchical nesting of the result.
            If a column is included in the query portion as `fields=<column name>`, the value will appear 
            in the leaf data object, but will not be used in creating the nested result object.

            The queryable columns are comprised of
              * The demographic aggregation categories:
                  + 'agegrp'
                  + 'education'
                  + 'ethnicity'
                  + 'race'
                  + 'sex'
              * The firm aggregation categories:
                  + 'firmage'
                  + 'firmsize'
              * Time categories:
                  + 'quarter'*
                  + 'year'*
              * Other categories
                  + 'geography'
                  + 'industry'

            (Note, quarter and year are always included in the leaf data objects.
              The question is whether they are used in creating the nested structure of the data.)

        Only certain combinations of demographic categories are supported:
          * Any category individually
          * Paired:
            + 'agegrp' & 'sex'
            + 'education' & 'sex'
            + 'race' & 'ethnicity'

        Firm aggregation categories an only be used individually.

      * Indicator values can only occur in the query portion. 
          If they occur in the URL path, this will result in an error response.
          If no indicator value is specified as a member of `fields`, an error is thrown.
            We do not include all the indicators and status_flags by the default 
              because there are 66 of them in total.
          The `/metadata/labels/indicators` and `/metadata/labels/status_flags` routes provide 
            a list of the possible indicators and status_flags, along with a description of each.

  Fields:
    Request fields in the query portion of the URL with (possibly repeated) fields=<field name> parameters.
      For example,

        `/geography0000036?fields=emp&fields=hira`
        
      will return the emp  (Beginning-of-Quarter Employment: Counts) 
        and the hira (Hires All: Counts) indicators for 


FIXME:
  Status flags yield "indicator not recognized" flag.
