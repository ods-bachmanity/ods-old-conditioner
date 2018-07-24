# ODS Conditioner (Work Engine)
Compose, Validate, Transform, Act and Respond on Imagery metadata for ODS Metadata Catalog

## note
The `./app` directory is NOT used for development. It is created as a part of the deployment process. It will contain latest compiled JavaScript files created when the 
script `npm run bundle` is executed. Please do not make changes and check into source control in this folder as they will not be merged into `master`

## latest
- **Testing**: Support for Mocha/Chai Unit Tests compiled alongside core code. Execution of tests as part of local development or as part of a development build. Tests can be built and executed using TypeScript (strongly typed JavaScript).
- **Deployment (Test)**: `npm run build` creates a local `./_build` directory with code ready for deployment into a testing environment. Code is optimized to support execution of Unit Tests.
- **Deployment (Prod)**: `npm run bundle` creates a local `./_bundle` directory with code ready for production deployment. Any development related artifacts and unit tests are stripped from the project to reduce footprint.
- **More developer friendly execution**: shift from separate development and live reload folder into a cohesive and single development environment. Reduce the need for developers to execute external build processes.
- **New Schema Layout**: focus on more human readable and intuitive schema for definitions of composers, validations, transforms and actions.
- **Consistent Error Handling**: A single approach for handling of runtime errors. Console logging as well as decoration of an Execution Context. TODO: `ExecutionContext.logs && ExecutionContext.errors`
- **Execution Context**: a new engine approach with dynamic parameters, composition, action
- **Separate Mock Service**: relocate mocking services out of the conditioner project and into a separate, autonomous project.
- **Support for Request Parameters**: New `catalog_endpoint_search` and `catalog_endpoint_update` parameters allow dynamic execution of action read and update
- **Authentication**: Introduce new mechanism for authentication (currently basic only) available for setup for composers and actions. Preparation for OAuth implementation
- **Separate services from Routes**: Separation of Concerns for services offering a better interface for Unit Testing.
- **Support for Single or Bulk Requests**: as before, endpoint support for a single request or a bulk collection of requests on a single endpoint.
- **Ordinal Workflow**: track and control transform execution using staged steps e.g. Ordinal 1 Fields are executed asynchronously before Ordinal 2 Fields. Each stage also affords an `after` step. For example: Ordinal 1 stage may validate and verify all required fields, Ordinal 2 stage can transform Coordinates and perform a conversion before finally having Ordinal 2's `after` step execute Country Code Lookup.
- **Prepared for New Fields**: research in preparation for new fields being introduced into definition schema.
- **Strong Definition Logic**: Support in definition for conditional logic such as switch case, required fields, white list, black list. TODO: RegEx, DataType(number, date, boolean)
- **Deployment (Docker)**: TODO: `npm run docker` creates a local `./docker` directory with code packaged ready for docker instantiation. IN PROGRESS.
- **Parameter Precondition Automated**: TODO: using definition, allow author to describe mandatory parameters with values vs. optional.

## environment
Begin with `npm install`.

This project uses TypeScript with ts-node and nodemon for development. 

Execute `npm start` to run the server on the localhost with hot reload.

Execute `npm test` to execute unit tests (mocha).

Execute `npm run build` to create a production bundle ready to be deployed and stripped of any non-production artifacts. This process uses the localbuilder.ts and localbuilder.config.json scripts
to deploy. Final bundle does not include nodemon or TypeScript.

## quick start
1. Create a local copy of `.env` as a copy of `cfg.env`.
2. Create any environment variables desired inside `.env` with format:
    - `SOMEUID=JOE`
    - `SOMEPWD=SMITH`
3. Confirm entries in `config/default.json` and `config/production.json`
    - API Prefix path (default to `/api/`)
    - Serve Static Content (any non-empty string maps to root of project. Use absolute or relative paths. Defaults to `./public/`)
    - API Port (defaults to 8080)
4. Create services in new folder (ex. `/src/shoes`). Can mimic pattern within `/common/healthCheck.ts`.
5. Create route handler inside `/routes/router.ts` to map to new service above.
6. If services rely on an external database connection, be sure to wrap the `rs.start()` method call of `index.ts` inside the callback from that connections startup asynchronous method e.g. don't start the server until the database connection pool has been started up and any necessary seeding processes completed.
    - e.g. `database.connection.open((err) => if (!err) rs.start() )` <- where the parameter to the open method is an asynchronous callback called only after the connection is established.
7. Create Unit Tests in `./test/` folder for each new service method created.

## notes

### development
Running `npm start` uses hot reload meaning any changes to `*.ts` files (or others) causes `nodemon` to automatically restart the server with the changes.

Test any new services using your favorite REST tool like Rested, Postman, any modern browser etc.

Run any unit tests at any time in a new console using `npm test`.

You can place any static content into (default `./public/`) folder and those assets will be served statically over the API Port. The path used is mapped inside `/config/default.json`. Setting the variable `serveStaticPath` to an empty string or removing it from the configuration file results in no static content being served.
- The endpoint from the client maps to the root of the webserver e.g. `serveStaticPath="./public/"` will map any request to `localhost:8080/somefile.txt` to `process.cwd()/public/somefile.txt`
- Another example request `localhost:8080/shoes/vendors.json` would map to `process.cwd()/public/shoes/vendor.json`

### creating assets
Anything created in `./public/` will be served as is e.g. Angular, React, Vue, PWA

To create a new Web API:
1. Create Service file in `./src/` folder
2. Export Service Class from `./src/index.ts`
3. Create Route in `./routes/`
4. Export Route in `./routes/index.ts`
5. Import Route in `./routes/router.ts`
6. Create Route Handler inside `Router.init()` method
7. All handlers should be asynchronous
8. Write Unit Tests in `./test` folder for service
9. Document API in `swagger.json` document

### todo
1. Support for Swagger UI rendering off of `./swagger.io`
