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
