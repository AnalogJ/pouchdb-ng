/* dropstore-ng v1.0.0 | (c) 2013 Jason Kulatunga, Inc. | http://analogj.mit-license.org/
 */

'use strict';

/* Services */
// when true, all pouchdb-ng ops are logged to the JavaScript console
// some critical errors and warnings are always logged, even if this is false
angular.module("pouchdb-ng", []).
    factory('pouchClient', function($rootScope,$q,safeApply,logger) {

        //Partially based on: https://gist.github.com/katowulf/5006634
        var pouchClient = {};
        logger.log('Creating pouch');
        ///////////////////////////////////////////////////////////////////////
        // Configuration
        ///////////////////////////////////////////////////////////////////////

        //add support for 'trim' to sad and lonely browsers
        if (!String.prototype.trim) {
            //code for trim
            String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
        }

        ///////////////////////////////////////////////////////////////////////
        // Private Methods
        ///////////////////////////////////////////////////////////////////////
        function basicDeferredCallback(deferred, cmdName){
            return function(err, res){
                safeApply($rootScope,function() {
                    if (err) {
                        logger.log('pouch "'+cmdName+'" returned error', err);
                        deferred.reject(err)
                    } else {
                        logger.log('pouch "'+cmdName+'" returned successfully', res);
                        deferred.resolve(res)
                    }
                });
            }
        }

        ///////////////////////////////////////////////////////////////////////
        // Public Methods
        ///////////////////////////////////////////////////////////////////////

        /**
         * List all databases
         * Retrieves all databases from PouchDB. (Adapter prefix of database is included if it was created with a prefix.)
         * By default, this feature is turned off and this function will return an empty list. To enable this feature and obtain a list of all the databases, set Pouch.enableAllDbs to true before creating any databases.
         * @returns {*}
         */
        pouchClient.allDbs = function(){
            var deferred = $q.defer();
            Pouch.allDbs(basicDeferredCallback(deferred, 'allDbs'));
            return deferred.promise;
        }

        Object.defineProperties(pouchClient, {
            "enableAllDbs": { get: function () { return Pouch.enableAllDbs; }, set: function(x) { Pouch.enableAllDbs = x; } }
        });

        /**
         * Create a database
         * This method gets an existing database if one exists or creates a new one if one does not exist. You may also
         * explicitly specify which backend you want to use for local database (e.g. idb://dbname or leveldb://dbname)
         * but usually it is convenient to let PouchDB choose the best backend by itself.
         * Note: Pouch reserves the prefix ‘_pouch_’ for the creation of local databases – all local databases will automatically be preprended with ‘_pouch_’.
         * @param name
         * @param options
         */
        pouchClient.create =  function(name, options) {
            return pouchDatabase(name, options);
        }

        /**
         * Delete database with given name
         * @param name
         * @returns {*}
         */
        pouchClient.destroy  = function(name){
            var deferred = $q.defer();
            Pouch.destroy(name, basicDeferredCallback(deferred, 'destroy'));
            return deferred.promise;
        }
        /**
         * Replicate a database
         * @param from
         * @param to
         * @param options
         * @returns {*}
         */
        pouchClient.replicate  = function(from, to, options){
            var deferred = $q.defer();
            Pouch.replicate(from, to, options, basicDeferredCallback(deferred, 'replicate'));
            return deferred.promise;
        }

        return pouchClient;
    })
    .factory('pouchDatabase', function($rootScope,$q,safeApply, logger) {

        return function(name, options){
            logger.log('Creating pouchClient');
            var pouchDatabase = {}
            ///////////////////////////////////////////////////////////////////////
            // Private Methods
            ///////////////////////////////////////////////////////////////////////
            function basicDeferredCallback(deferred, cmdName){
                return function(err, res){
                    safeApply($rootScope,function() {
                        if (err) {
                            logger.log('pouchClient "'+cmdName+'" returned error', err);
                            deferred.reject(err)
                        } else {
                            logger.log('pouchClient "'+cmdName+'" returned successfully', res);
                            deferred.resolve(res)
                        }
                    });
                }
            }

            ///////////////////////////////////////////////////////////////////////
            // Public Methods
            ///////////////////////////////////////////////////////////////////////
            //should never be called directly, but is available for custom calls.
            pouchDatabase._database = new Pouch(name, options);

            /**
             * Create a document
             * Create a new document. Only use db.post if you want PouchDB to generate an ID for your document, otherwise use db.put
             * @param doc
             * @param options
             * @returns {*}
             */
            pouchDatabase.post =  function(doc, options) {
                var deferred = $q.defer();
                pouchDatabase._database.post(doc, options, basicDeferredCallback(deferred, 'post'));
                return deferred.promise;
            }
            /**
             * Update a document
             * Create a new document or update an existing document. If the document already exists you must specify its revision (_rev), otherwise a conflict will occur.
             * @param doc
             * @param options
             * @returns {*}
             */
            pouchDatabase.put =  function(doc, options) {
                var deferred = $q.defer();
                pouchDatabase._database.put(doc, options, basicDeferredCallback(deferred, 'put'));
                return deferred.promise;
            }

            /**
             * Save an attachment
             * Create an attachment in an existing document.
             * @param id
             * @param rev
             * @param doc
             * @param type
             * @returns {*}
             */
            pouchDatabase.putAttachment =  function(id, rev, doc, type) {
                var deferred = $q.defer();
                pouchDatabase._database.putAttachment(id, rev, doc, type, basicDeferredCallback(deferred, 'putAttachment'));
                return deferred.promise;
            }

            /**
             * Get an attachment
             * @param id
             * @returns {*}
             */
            pouchDatabase.getAttachment =  function(id) {
                var deferred = $q.defer();
                pouchDatabase._database.getAttachment(id, basicDeferredCallback(deferred, 'getAttachment'));
                return deferred.promise;
            }

            /**
             * Delete an attachment from a doc.
             * @param id
             * @param rev
             * @returns {*}
             */
            pouchDatabase.removeAttachment =  function(id, rev) {
                var deferred = $q.defer();
                pouchDatabase._database.removeAttachment(id, rev, basicDeferredCallback(deferred, 'removeAttachment'));
                return deferred.promise;
            }

            /**
             * Create a batch of documents
             * Modify, create or delete multiple documents. If you omit an _id parameter on a given document, the database will create a new document and assign an ID for you. To update a document you must include both an _id parameter and a _rev parameter, which should match the ID and revision of the document on which to base your updates. Finally, to delete a document, include a _deleted parameter with the value true.
             * options.new_edits: Prevent the database from assigning new revision IDs to the documents.
             * @param docs
             * @param options
             * @returns {*}
             */
            pouchDatabase.bulkDocs =  function(docs, options) {
                var deferred = $q.defer();
                pouchDatabase._database.bulkDocs(docs, options, basicDeferredCallback(deferred, 'bulkDocs'));
                return deferred.promise;
            }
            /**
             * Retrieves a document, specified by docid.

             options.rev: Fetch specific revision of a document. Defaults to winning revision (see couchdb guide.
             options.revs: Include revision history of the document
             options.revs_info: Include a list of revisions of the document, and their availability.
             options.open_revs: Fetch all leaf revisions if open_revs=”all” or fetch all leaf revisions specified in open_revs array. Leaves will be returned in the same order as specified in input array
             options.conflicts: If specified conflicting leaf revisions will be attached in _conflicts array
             options.attachments: Include attachment data
             options.local_seq: Include sequence number of the revision in the database
             * @param docs
             * @param options
             * @returns {*}
             */
            pouchDatabase.get =  function(docs, options) {
                var deferred = $q.defer();
                pouchDatabase._database.get(docs, options, basicDeferredCallback(deferred, 'get'));
                return deferred.promise;
            }

            /**
             * Fetch multiple documents, deleted document are only included if options.keys is specified.
             * options.include_docs: Include the document in each row in the doc field - options.conflicts: Include conflicts in the _conflicts field of a doc
             options.startkey & options.endkey: Get documents with keys in a certain range
             options.descending: Reverse the order of the output table
             options.keys: array of keys you want to get - neither startkey nor endkey can be specified with this option - the rows are returned in the same order as the supplied “keys” array - the row for a deleted document will have the revision ID of the deletion, and an extra key “deleted”:true in the “value” property - the row for a nonexistent document will just contain an “error” property with the value “not_found”
             * @param options
             * @returns {*}
             */
            pouchDatabase.allDocs =  function(options) {
                var deferred = $q.defer();
                pouchDatabase._database.allDocs( options, basicDeferredCallback(deferred, 'allDocs'));
                return deferred.promise;
            }

            /**
             * Query the database
             * Retrieve a view.
             * @param fun
             * @param options
             * @returns {*}
             */
            pouchDatabase.query =  function(fun,options) {
                var deferred = $q.defer();
                pouchDatabase._database.query( fun,options, basicDeferredCallback(deferred, 'query'));
                return deferred.promise;
            }
            /**
             * Delete a document
             * @param doc
             * @param options
             * @returns {*}
             */
            pouchDatabase.remove =  function(doc,options) {
                var deferred = $q.defer();
                pouchDatabase._database.remove( doc,options, basicDeferredCallback(deferred, 'remove'));
                return deferred.promise;
            }

            /**
             * Get information about a database.
             * @returns {*}
             */
            pouchDatabase.info =  function() {
                var deferred = $q.defer();
                pouchDatabase._database.info(basicDeferredCallback(deferred, 'info'));
                return deferred.promise;
            }
            /**
             * Listen to database changes
             * A list of changes made to documents in the database, in the order they were made. If options.continuous is set it returns object with one method cancel which you call if you don’t want to listen to new changes anymore.
             * @param options
             * @returns {*}
             */
            pouchDatabase.changes =  function(options) {
                return pouchDatabase._database.changes(options);
            }
            /**
             * Compact the database
             * Runs compaction of the database. Fires callback when compaction is done. If you use http adapter and have specified callback Pouch will ping the remote database in regular intervals unless the compaction is finished.

             options.interval: Number of milliseconds Pouch waits before asking again if compaction is already done. Only for http adapter
             * @param options
             * @returns {*}
             */
            pouchDatabase.compact =  function(options) {
                var deferred = $q.defer();
                pouchDatabase._database.compact(options,basicDeferredCallback(deferred, 'compact'));
                return deferred.promise;
            }
            /**
             * Document Revisions Diff
             * Given a set of document/revision IDs, returns the subset of those that do not correspond to revisions stored in the database. Primarily used in replication.
             * @param options
             * @returns {*}
             */
            pouchDatabase.revsDiff =  function(options) {
                var deferred = $q.defer();
                pouchDatabase._database.revsDiff(options,basicDeferredCallback(deferred, 'revsDiff'));
                return deferred.promise;
            }

            return pouchDatabase;
        }
    })
    .factory('safeApply', [function($rootScope) {
        return function($scope, fn) {
            var phase = $scope.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if (fn) {
                    $scope.$eval(fn);
                }
            } else {
                if (fn) {
                    $scope.$apply(fn);
                } else {
                    $scope.$apply();
                }
            }
        }
    }])
    .provider('logger', function(){
        this.DEVMODE = false;

        this.setDEVMODE = function(devmode){
            this.DEVMODE = devmode;
        }

        this.$get = ['$window',function($window) {
            var DEVMODE = this.DEVMODE;
            var logger = {};
            logger.log = function(){
                DEVMODE && console.log.apply(console, arguments);
            }
            logger.always = function(){
                console.log.apply(console, arguments);
            }
            return logger;
        }]
    })
    .config(function(loggerProvider){
        loggerProvider.setDEVMODE(true);
    });




