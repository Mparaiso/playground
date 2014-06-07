/*global beforeEach,angular,describe,expect,it,jasmine,module,inject*/
describe("notification", function() {
	"use strict";
	beforeEach(function() {
		var self = this;
		module('notification');
		inject(function(Notification, $timeout) {
			self.Notification = Notification;
			self.$timeout = $timeout;
		});
	});
	describe("Notification", function() {
		it('#notify', function() {
			this.Notification.notify({
				text: 'foo',
				type: this.Notification.type.INFO
			});
			expect(this.Notification.current.text).toBe('foo');
			expect(this.Notification.notifications.length).toBe(0);
			this.$timeout.flush();
			expect(this.Notification.current).toBe(null);
		});
	});
});
