_NOTE: This documentation page is a work in progress._

- [Introduction](#sec-1)
- [QWI Dataset Overview](#sec-2)
- [Additional Route Segments](#sec-3)
  - [Specifying the Response Structure](#sec-3-1)
  - [Supported Category Combinations](#sec-3-2)
    - [Supported Demographic and Establishment Category Interactions](#sec-3-2-1)
- [Category Codes](#sec-4)
    - [agegrp](#sec-4-1)
    - [education](#sec-4-2)
    - [ethnicity](#sec-4-3)
    - [race](#sec-4-4)
    - [firmage](#sec-4-5)
    - [firmsize](#sec-4-6)
    - [industry](#sec-4-7)
    - [geography](#sec-4-8)
- [Indicators](#sec-5)
- [Additional Query Parameters](#sec-6)
    - [flat responses](#sec-6-1)
    - [flat leaves](#sec-6-2)
    - [dense](#sec-6-3)


# Introduction<a id="sec-1" name="sec-1"></a>


This project was created under a grant from the [Ewing Marion Kauffman Foundation](http://www.kauffman.org/).

This repository contains code for an JSON API to 
the U.S. Census Bureau's Quarterly Workforce Indicators 
([QWI](http://lehd.ces.census.gov/data/)) dataset.
This application focuses on the Metropolitian level data from the QWI
due to the fact that the county level data takes over 2T of disk space.

This project is composed entirely of JavaScript code and SQL scripts 
that download the CSV files hosted on the Census Bureau's website 
and uploads them to a Postgres database.
The only dependencies are a Postgres database and an Node environment,
and administrators need only run a couple of scripts to fire up an instance of this API.

Table and column names map one-to-one with names from the Census data and documentation.
Users familiar with the QWI dataset should find the JSON API easy to learn, intuitive, and powerful.
For users not yet aquainted with the dataset, informative error messages should make learning 
how to leverage this tool relatively easy.

A Node/Express application server connects to the Postgres database and serves the content.
The performance of Node, together with clustered indices build on the database tables,
provide users with sub-second response times. 
This API server can power interactive data exploration tools.

# QWI Dataset Overview<a id="sec-2" name="sec-2"></a>

From the [Quarterly Workforce Indicators 101](http://lehd.ces.census.gov/doc/QWI_101.pdf) document:

> The Quarterly Workforce Indicators (QWI) provide local labor market statistics by industry, worker
> demographics, employer age and size. Unlike statistics tabulated from firm or person-level data, the QWI
> source data are unique job-level data that link workers to their employers. Because of this link, labor market
> data in the QWI is available by worker age, sex, educational attainment, and race/ethnicity. This allows for
> analysis by demographics of a particular local labor market or industry – for instance, identifying industries with
> aging workforces. Links between workers and firms also allow the QWI to identify worker flows – hires,
> separations, and turnover – as well as net employment growth. As most hiring activity is the consequence of
> worker turnover rather than employment growth, a focus on employment growth alone may misrepresent
> employment opportunity in the local labor market. Wages by industry and demographics as well as by whether
> the worker was newly hired are also available. QWI wages for new hires can be compared to wages for
> continuing workers, and wage growth for similar workers across industries can be compared to identify
> important local labor market trends.
> The source data for the QWI is the Longitudinal Employer-Household Dynamics (LEHD) linked employeremployee
> microdata. The LEHD data is massive longitudinal database covering over 95% of U.S. private sector
> jobs. Much of this data is collected via a unique federal-state data sharing collaboration, the Local Employment
> Dynamics (LED) partnership. LED is a cooperative venture between the LEHD program at the U.S. Census
> Bureau and state agencies of all 50 states, the District of Columbia, Puerto Rico, and the U.S. Virgin Islands2.
>
> Partner states voluntarily submit quarterly data files from existing administrative record systems, which are
> combined with a range of other data sources to generate public use products, including QWI and LODES (LEHD
> Origin-Destination Employment Statistics, presented in OnTheMap) and other new products in development. By
> integrating data used to administer public programs with existing census and surveys, a new national jobs
> database is generated at very low cost and with no additional respondent burden. 

The data from the U.S. Census Bureau is available tabulated to 
national, state, metropolitan/micropolitan areas, county, and Workforce Investment Board (WIB) areas,
however *this API only serves data found in the metropolitian-level CSVs*.


# Dynamic Routes<a id="sec-3" name="sec-3"></a>

## Specifying the Response Structure<a id="sec-3-1" name="sec-3-1"></a>
The `qwiAPI` features _Dynamic Routes_ that allow clients to query the dataset
based on worker demographics, employer characteristics, and/or industry,
The server response will be in the form of a JSON object
with a hierarchial structure that parallels the query's Dynamic Route. 
In other words, *users of this API can specify the structure of the response object
through the stucture of the route they use to request the data*.
This functionality makes for exceptionally clean code in client apps.
(This behavior can be turned off via the `flat` parameter, as described below.)

For example, if the client wanted a response broken down by industry, then firmage,
the dynamic route would contain the sequence `/industry/firmage`. 
The response object would contain data nested in that order: each industry would have a object keyed by firmage.
Conversely, `/firmage/industry` would yield a response where each firmage has an object keyed by industry code.

To specifically request all 0-1 year firms in Construction, 
the request would include the respective QWI firmage code
and NAICS industry code: `/industry00023/firmage1`.
Notice that the industry value is zero-padded. 

The required code lengths for the route parameters are specified below in the [API Syntax]() section.

## Supported query parameters and their lengths<a id="sec-3-2" name="sec-3-2"></a>

Each of the categories listed in the following table
can appear as a segment in the dynamic route.
Consequently, they can be used to specify the JSON response structure
and to filter the information in the response.
Values specified as filters *must be zero-padded* if the requested value
is less than the length specified in the following table.
(This can occur for geography and industry categories.)

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">

  <colgroup>
    <col class="left" />
    <col class="left" />
    <col class="left" />
  </colgroup>

  <thead>
    <tr>
      <th scope="col" class="left">Route Segment</th>
      <th scope="col" class="left">Length</th>
      <th scope="col" class="left">Description</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td class="left">geography</td>
      <td class="left">7</td>
      <td class="left">Geography code</td>
    </tr>

    <tr>
      <td class="left">industry</td>
      <td class="left">5</td>
      <td class="left">Industry code</td>
    </tr>

    <tr>
      <td class="left">sex</td>
      <td class="left">1</td>
      <td class="left">Gender code</td>
    </tr>

    <tr>
      <td class="left">agegrp</td>
      <td class="left">3</td>
      <td class="left">Age group code (WIA)</td>
    </tr>

    <tr>
      <td class="left">race</td>
      <td class="left">2</td>
      <td class="left">Race</td>
    </tr>

    <tr>
      <td class="left">ethnicity</td>
      <td class="left">2</td>
      <td class="left">Ethnicity</td>
    </tr>

    <tr>
      <td class="left">education</td>
      <td class="left">2</td>
      <td class="left">Education</td>
    </tr>

    <tr>
      <td class="left">firmage</td>
      <td class="left">1</td>
      <td class="left">Firm Age group</td>
    </tr>

    <tr>
      <td class="left">firmsize</td>
      <td class="left">1</td>
      <td class="left">Firm Size group</td>
    </tr>

    <tr>
      <td class="left">year</td>
      <td class="left">4</td>
      <td class="left">Year</td>
    </tr>

    <tr>
      <td class="left">quarter</td>
      <td class="left">1</td>
      <td class="left">Quarter</td>
    </tr>
  </tbody>
</table>

A more detailed explanation of the routing syntax follows in the [API Syntax]() section,
and examples can be found in the [Examples]() section.


## Supported category combinations<a id="sec-2-1" name="sec-3-2-1"></a>

From the [Quarterly Workforce Indicators 101](http://lehd.ces.census.gov/doc/QWI_101.pdf) document:

> The QWI are aggregated from the job level to establishments, and then to a number of higher level categories
> for public release. These categories are interacted in various combinations on the public release files. Within
> the public release files, totals for each category are included along with detailed components.
>
> The demographic categories available on the QWI include age, sex, race, ethnicity, and education. The
> interactions selected for publication include:
> * Sex by Age [sa]
> * Race by Ethnicity [rh]
> * Sex by Education [se]
>
> Firm age and size are defined at the national level, rather than the state level. 
> A national firm may frequently be larger or older than the part of that firm found in any one state. 
> Firm age and size are reported only for private sector firms, and are not interacted with each other.
> * Firm Age [fa]
> * Firm Size [fs]

The U.S. Census Bureau provides data for each combination of demographic and firm categories interactions,
but, *the listed category interactions within the demographic and firm classes cannot be combined*.
All combinations provided by the Census Bureau are available through this API. 
Category interactions outside of these are not supported and will result in an error message.

The following categories can be used in combination with any others:
* geography
* industry
* year
* quarter

In fact, _'geography' is required in all requests_. (The dataset is too large to return all geographies by default.)

For the sake clarity, supported demographic and establishment category interactions shown in the following table.

### Supported Demographic and Establishment Category Interactions
<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">

  <colgroup>
    <col class="center" />
    <col class="center" />
    <col class="left" />
    <col class="left" />
  </colgroup>

  <thead>
    <tr>
      <th scope="col" class="left">Demographic Categories</th>
      <th scope="col" class="left">Firm Categories</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td class="left">sex & agegrp</td>
      <td class="left">firmage</td>
    </tr>

    <tr>
      <td class="left">sex & education</td>
      <td class="left">firmage</td>
    </tr>

    <tr>
      <td class="left">race & ethnicity</td>
      <td class="left">firmage</td>
    </tr>

    <tr>
      <td class="left">sex & agegrp</td>
      <td class="left">firmsize</td>
    </tr>

    <tr>
      <td class="left">sex & education</td>
      <td class="left">firmsize</td>
    </tr>

    <tr>
      <td class="left">race & ethnicity</td>
      <td class="left">firmsize</td>
    </tr>
  </tbody>
</table>

For example, API clients can request data for all female employees 
with a bachelor’s degree or advanced degree with the following sub-route:
  `/sex2/educationE4`

However, a query for all 35-44 year old employees 
with a bachelor’s degree or advanced degree would result in an error code because
the combination of employee age group and education level is not supported.
  ~~`/agegrpA05/educationE4`~~

A more detailed explanation of the routing syntax follows in the [API Syntax]() section,
and examples can be found in the [Examples]() section.


# Category Codes<a id="sec-4" name="sec-4"></a>

For reference, the 'Categorical Variables' section of the
[Quarterly Workforce Indicators 101](http://lehd.ces.census.gov/doc/QWI_101.pdf) 
document is included below.
The left-hand column in each of the above tables 
shows values that can be used to filter the response's information.
Note that the above tables contain all the values in the domain of each category.
If filter values outside of a category's domain are specified, an error 
message will be sent to the client.

### agegrp<a id="sec-4-1" name="sec-4-1"></a>
<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">

  <colgroup>
    <col class="center" />
    <col class="center" />
    <col class="center" />
  </colgroup>

  <thead>
    <tr>
      <th scope="col" class="center">agegrp</th>
      <th scope="col" class="center">label</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td class="center">A00</td>
      <td class="center">All Ages (14-99)</td>
    </tr>

    <tr>
      <td class="center">A01</td>
      <td class="center">14-18</td>
    </tr>
    <tr>
      <td class="center">A02</td>
      <td class="center">19-21</td>
    </tr>
    <tr>
      <td class="center">A03</td>
      <td class="center">22-24</td>
    </tr>
    <tr>
      <td class="center">A04</td>
      <td class="center">25-34</td>
    </tr>
    <tr>
      <td class="center">A05</td>
      <td class="center">35-44</td>
    </tr>
    <tr>
      <td class="center">A06</td>
      <td class="center">45-54</td>
    </tr>
    <tr>
      <td class="center">A07</td>
      <td class="center">55-64</td>
    </tr>
    <tr>
      <td class="center">A08</td>
      <td class="center">65-99</td>
    </tr>
  </tbody>
</table>


### education<a id="sec-4-2" name="sec-4-2"></a>
<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">

  <colgroup>
    <col class="center" />
    <col class="center" />
    <col class="center" />
  </colgroup>

  <thead>
    <tr>
      <th scope="col" class="center">education</th>
      <th scope="col" class="center">label</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td class="center">E0</td>
      <td class="center">All Education Categories</td>
    </tr>
    <tr>
      <td class="center">E1</td>
      <td class="center">Less than high school</td>
    </tr>
    <tr>
      <td class="center">E2</td>
      <td class="center">High school or equivalent, no college</td>
    </tr>
    <tr>
      <td class="center">E3</td>
      <td class="center">Some college or Associate degree</td>
    </tr>
    <tr>
      <td class="center">E4</td>
      <td class="center">Bachelor’s degree or advanced degree</td>
    </tr>
    <tr>
      <td class="center">E5</td>
      <td class="center">Educational attainment not available (workers aged 24 or younger)</td>
    </tr>
  </tbody>
</table>

### ethnicity<a id="sec-4-3" name="sec-4-3"></a>
<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">

  <colgroup>
    <col class="center" />
    <col class="center" />
    <col class="center" />
  </colgroup>

  <thead>
    <tr>
      <th scope="col" class="center">education</th>
      <th scope="col" class="center">label</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td class="center">A0</td>
      <td class="center">All Ethnicities</td>
    </tr>
    <tr>
      <td class="center">A1</td>
      <td class="center">Not Hispanic or Latino</td>
    </tr>
    <tr>
      <td class="center">A2</td>
      <td class="center">Hispanic or Latino</td>
    </tr>
  </tbody>
</table>


### race<a id="sec-4-4" name="sec-4-4"></a>
<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">

  <colgroup>
    <col class="center" />
    <col class="center" />
    <col class="center" />
  </colgroup>

  <thead>
    <tr>
      <th scope="col" class="center">race</th>
      <th scope="col" class="center">label</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td class="center">A0</td>
      <td class="center">All Races</td>
    </tr>
    <tr>
      <td class="center">A1</td>
      <td class="center">White Alone</td>
    </tr>
    <tr>
      <td class="center">A2</td>
      <td class="center">Black or African American Alone</td>
    </tr>
    <tr>
      <td class="center">A3</td>
      <td class="center">American Indian or Alaska Native Alone</td>
    </tr>
    <tr>
      <td class="center">A4</td>
      <td class="center">Asian Alone</td>
    </tr>
    <tr>
      <td class="center">A5</td>
      <td class="center">Native Hawaiian or Other Pacific Islander Alone</td>
    </tr>
    <tr>
      <td class="center">A6</td>
      <td class="center">Some Other Race Alone (Not Used)</td>
    </tr>
    <tr>
      <td class="center">A6</td>
      <td class="center">Two or More Race Groups</td>
    </tr>
  </tbody>
</table>


### firmage<a id="sec-4-5" name="sec-4-5"></a>
<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">

  <colgroup>
    <col class="center" />
    <col class="center" />
    <col class="center" />
  </colgroup>

  <thead>
    <tr>
      <th scope="col" class="center">firmage</th>
      <th scope="col" class="center">label</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td class="center">0</td>
      <td class="center">All Firm Ages</td>
    </tr>
    <tr>
      <td class="center">A1</td>
      <td class="center">0-1 Years</td>
    </tr>
    <tr>
      <td class="center">2</td>
      <td class="center">2-3 Years</td>
    </tr>
    <tr>
      <td class="center">3</td>
      <td class="center">4-5 Years</td>
    </tr>
    <tr>
      <td class="center">4</td>
      <td class="center">6-10 Years</td>
    </tr>
    <tr>
      <td class="center">5</td>
      <td class="center">11+ Years</td>
    </tr>
  </tbody>
</table>

### firmsize<a id="sec-4-6" name="sec-4-6"></a>

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">

  <colgroup>
    <col class="left" />
    <col class="left" />
    <col class="left" />
  </colgroup>

  <thead>
    <tr>
      <th scope="col" class="center">firmsize</th>
      <th scope="col" class="left">label</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td class="center">0</td>
      <td class="left">0-19 Employees</td>
    </tr>
    <tr>
      <td class="center">1</td>
      <td class="left">20-49 Employees</td>
    </tr>
    <tr>
      <td class="center">2</td>
      <td class="left">50-249 Employees</td>
    </tr>
    <tr>
      <td class="center">3</td>
      <td class="left">250-499 Employees</td>
    </tr>
    <tr>
      <td class="center">4</td>
      <td class="left">500+ Employees</td>
    </tr>
  </tbody>
</table>


### industry<a id="sec-4-7" name="sec-4-7"></a>

Currently, this API contains only the Metropolitan level data from level data from the QWI dataset.
At this geographic level, with the firm categories, the Census Bureau only provides 
'industry' breakdowns at the 2-digit NAICS Sectors detail level.
(4-digit breakdowns are available without firm characteristics.)

### geography<a id="sec-4-8" name="sec-4-8"></a>

At least one 'geography' code is required in the dynamic route. Many can be specified.

From [LEHD Public Use Data Schema V4.0.5](http://lehd.ces.census.gov/data/schema/latest/lehd_public_use_schema.html#geo_level)

> Metropolitan codes are constructed from the 2-digit state FIPS code 
> and the 5-digit [CBSA](http://www.census.gov/population/metro/) code provided by the 
> Census Bureau’s Geography Division.
>
> In the QWI, the metropolitan/micropolitan areas are the state parts of the full CBSA areas.

In otherwords, to specify a metropolitan area in a request, 
*clients must prepend the state's 2-digit FIPS code to the metro area's 5-digit CBSA code.*
Thus, geographies are 7-digits in length. Note: you can query for state level data as well
by zero-padding the 2-digit FIPS code for the state, however, the state-level
data served by this API is limited to what the metro-level data files from the Census Bureau contain.

The Census Bureau provides a composite file containing all geocodes: 
[label_geography_all.csv](http://lehd.ces.census.gov/data/schema/latest/label_geography_all.csv)


# Indicators<a id="sec-5" name="sec-5"></a>

The following table, taken from the 
[LEHD Public Use Data Schema V4.0.5](http://lehd.ces.census.gov/data/schema/latest/lehd_public_use_schema.html#_a_id_indicators_a_indicators), lists the indicator variables available in the data set. 

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">

  <colgroup>
    <col class="left" />
    <col class="left" />
    <col class="left" />
  </colgroup>

  <thead>
    <tr>
      <th scope="col" class="left">Indicator Variable</th>
      <th scope="col" class="left">Indicator Name</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td class="left">Emp</td>
      <td class="left">Beginning-of-Quarter Employment: Counts</td>
    </tr>
    <tr>
      <td class="left">EmpEnd</td>
      <td class="left">End-of-Quarter Employment: Counts</td>
    </tr>
    <tr>
      <td class="left">EmpS</td>
      <td class="left">Full-Quarter Employment (Stable): Counts</td>
    </tr>
    <tr>
      <td class="left">EmpSpv</td>
      <td class="left">Full-Quarter Employment in the Previous Quarter: Counts</td>
    </tr>
    <tr>
      <td class="left">EmpTotal</td>
      <td class="left">Employment - Reference Quarter: Counts</td>
    </tr>
    <tr>
      <td class="left">HirA</td>
      <td class="left">Hires All: Counts (Accessions)</td>
    </tr>
    <tr>
      <td class="left">HirN</td>
      <td class="left">Hires New: Counts</td>
    </tr>
    <tr>
      <td class="left">HirR</td>
      <td class="left">Hires Recalls: Counts</td>
    </tr>
    <tr>
      <td class="left">Sep</td>
      <td class="left">Separations: Counts</td>
    </tr>
    <tr>
      <td class="left">HirAEnd</td>
      <td class="left">End-of-Quarter Hires</td>
    </tr>
    <tr>
      <td class="left">HirAEndR</td>
      <td class="left">End-of-Quarter Hiring Rate</td>
    </tr>
    <tr>
      <td class="left">SepBeg</td>
      <td class="left">Beginning-of-Quarter Separations</td>
    </tr>
    <tr>
      <td class="left">SepBegR</td>
      <td class="left">Beginning-of-Quarter Separation Rate</td>
    </tr>
    <tr>
      <td class="left">HirAS</td>
      <td class="left">Hires All (Stable): Counts (Flows into Full-Quarter Employment)</td>
    </tr>
    <tr>
      <td class="left">HirNS</td>
      <td class="left">Hires New (Stable): Counts (New Hires to Full-Quarter Status)</td>
    </tr>
    <tr>
      <td class="left">SepS</td>
      <td class="left">Separations (Stable): Counts (Flow out of Full-Quarter Employment)</td>
    </tr>
    <tr>
      <td class="left">SepSnx</td>
      <td class="left">Separations (Stable): Next Quarter: Counts (Flow out of Full-Quarter Employment)</td>
    </tr>
    <tr>
      <td class="left">TurnOvrS</td>
      <td class="left">Turnover (Stable)</td>
    </tr>
    <tr>
      <td class="left">FrmJbGn</td>
      <td class="left">Firm Job Gains: Counts (Job Creation)</td>
    </tr>
    <tr>
      <td class="left">FrmJbLs</td>
      <td class="left">Firm Job Loss: Counts (Job Destruction)</td>
    </tr>
    <tr>
      <td class="left">FrmJbC</td>
      <td class="left">Firm Job Change: Net Change</td>
    </tr>
    <tr>
      <td class="left">HirAEndRepl</td>
      <td class="left">Replacement Hires</td>
    </tr>
    <tr>
      <td class="left">HirAEndReplr</td>
      <td class="left">Replacement Hiring Rate</td>
    </tr>
    <tr>
      <td class="left">FrmJbGnS</td>
      <td class="left">Firm Job Gains (Stable): Counts</td>
    </tr>
    <tr>
      <td class="left">FrmJbLsS</td>
      <td class="left">Firm Job Loss (Stable): Counts</td>
    </tr>
    <tr>
      <td class="left">FrmJbCS</td>
      <td class="left">Job Change (Stable): Net Change</td>
    </tr>
    <tr>
      <td class="left">EarnS</td>
      <td class="left">Full Quarter Employment (Stable): Average Monthly Earnings</td>
    </tr>
    <tr>
      <td class="left">EarnBeg</td>
      <td class="left">Beginning-of-Quarter Employment: Average Monthly Earnings</td>
    </tr>
    <tr>
      <td class="left">EarnHirAS</td>
      <td class="left">Hires All (Stable): Average Monthly Earnings</td>
    </tr>
    <tr>
      <td class="left">EarnHirNS</td>
      <td class="left">Hires New (Stable): Average Monthly Earnings</td>
    </tr>
    <tr>
      <td class="left">EarnSepS</td>
      <td class="left">Separations (Stable): Average Monthly Earnings</td>
    </tr>
    <tr>
      <td class="left">Payroll</td>
      <td class="left">Total Quarterly Payroll: Sum</td>
    </tr>
  </tbody>
</table>

*Requested indicators must appear in the query parameters of a request, NOT in the dynamic URI.*
The URI dynamic path segments must contain only the aggregation categories, 
'industry', 'geography', 'year', and 'quarter'.
Requested indicators are specified using the (possibly repeated) 'fields' query parameter.
For example, to request 'TurnOvrS' and 'Payroll', the query portion of the request would contain
`?fields=TurnOvrs&fields=Payroll`.

A more detailed explanation of the query parameter syntax follows in the [API Syntax]() section,
and examples can be found in the [Examples]() section.

Note that the status flag for each indicator is also available. Status flag names are simply 
the indicator name prepended with an 's'.

# Additional Query Parameters<a id="sec-6" name="sec-6"></a>

In addition to the 'fields' parameter explained in the previous section, 
other parameters are provided that allow the user to alter the 
structure of the response object.

## Flat Responses<a id="sec-6-1" name="sec-6-1"></a>

If the hierarchical structure of the response object is not desired,
data may be returned as an array of rows by passing the query parameter `flat=true`.

## Flat Leaves<a id="sec-6-2" name="sec-6-2"></a>

By default, the leafs of the hierarchical response object will be arrays.
This may not be the desired functionality, so 
it is possible to request flat leaves with the `flatLeaves=true` query parameter.
Note that if the length of the leaf arrays does not equal 1,
specifying 'flatLeaves' will result in an error.
Specifically, to request flat leaves, 
it is necessary to include 'year' and 'quarter' in the dynamic route
because if they are not part of the response object's nesting structure,
the leaf arrays will contain elements for each economic quarter.

## Dense Responses<a id="sec-6-3" name="sec-6-3"></a>

By default, the leaves of the response object will contain fields for each
segment of the dynamic route. This means that information is repeated. 
For example, if the route contains `/industry/race/year/quarter`, each of those categories
will appear as a key in the response object's leaves with the respective variable's value,
and therefore this information will also be contained in the keys of each layer of 
If the client has not specified 'flat=true' in the query parameters,
to remove this redundancy clients may specify 'dense=true' 
This will remove from the leaves all information contained in the response's
heirarchial structure.

Examples can be found in the [Examples]() section.
