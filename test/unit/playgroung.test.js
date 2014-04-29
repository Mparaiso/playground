/*global requirejs,describe,it,expect,beforeEach*/
describe('Test', function () {
    "use strict";
    beforeEach(function () {
        define('something',function () {
            return foo;
        });
    });
    it('should not throw an error', function () {
        expect(1).toEqual(1);
    });
});
