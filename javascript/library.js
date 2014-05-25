/*global angular*/
angular.module('library', [])
.service('Library', function($http,$q) {
    /** manage cdn integration */
    "use strict";
    var self=this;
    /** cdn url */
    this.cdnUrl = "//cdn.jsdelivr.net/";
    /** api url */
    this.apiUrl="//api.jsdelivr.com/v1/jsdelivr/libraries";
    /** search results */
    this.lastSearchResults = [];
    this.lastsearchQuery = null;
    /** 
     * Search for web libraries
     * @param {string} query the library to search for
     * @return {Promise}
     */
    this.query = function(query) {
        this.lastsearchQuery = query;
        return $http({
            method:'GET',
            url:self.apiUrl,
            params:{mainfile:query+"*",fields:"mainfile,name,assets"}
        })
        .then(function(request) {
            return  request.data.sort(function(library,nextLibrary){
                return library.mainfile.length < nextLibrary.mainfile.length? -1 : 1; // sort library by mainfile length
            }).map(function(library){
                //takes the first version of each library and construct an url for each file
                var assets = library.assets.shift();
                var version = assets.version;
                // returns an array of files
                return assets.files.map(function(file){
                    return self.cdnUrl+library.name+"/"+version+"/"+file;
                });
            }).reduce(function(result,files){
                //flatten the array of files into a single array of files
                files.filter(function(file){
                    return file.match(/\.(js|css)$/); // filter out .map files
                }).sort(function(file,nextFile){
                    return file.length < nextFile.length ? -1 : 1; // filter files by length asc
                }).forEach(function(file){
                    result.push(file); // push each file into the final array
                });
                return result;
            },[]);
            //extract the library url of each result
        });
    };
});
