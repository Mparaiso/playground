/*global describe,inject,module,beforeEach*/
/**
 * test/unit/library.test.js
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
describe('library',function(){
    beforeEach(function(){
        var self=this;
        module('library');
        inject(function  (Library,$httpBackend) {
            self.Library=Library;
            self.$httpBackend=$httpBackend;
        });
    });
    describe('#query',function(){
        beforeEach(function(){
            this.$httpBackend.when('GET',new RegExp(this.Library.apiUrl)).respond(200,[]);
        });
        afterEach(function() {
            // this.$httpBackend.verifyNoOutstandingExpectation();
            this.$httpBackend.verifyNoOutstandingRequest();
        });
        it('should return an array',function(done){
            var self=this;
            var query='jquery';
            this.Library.query(query).then(function(res){
                expect(res instanceof Array).toBe(true);
                expect(self.Library.lastsearchQuery).toEqual(query);
            }).then(done);
            this.$httpBackend.flush();
        });
    });
});
