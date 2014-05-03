/*global angular*/
(function() {
	"use strict";
	angular.module('notification', [])
		.constant('NOTIFICATION_TIME', 4000)
		.service('Notification', function($timeout, $window, NOTIFICATION_TIME) {
			/**
			 * manage notifications
			 */
			var onNotificationTimeEnd ;
			this.type = {
				'SUCCESS': 'text-success',
				'ERROR': 'text-error',
				'INFO': 'text-info'
			};
			this.timeout = null;
			this.current = null;
			this.notifications=[];
			/**
			 * queue app notifications
			 * @param  {Object} notif
			 * @return {Promise}
			 */
			this.notify = function(notif) {
				if(notif){
					this.notifications.push(notif);
				}
				if(!this.current){
					this.current = this.notifications.pop();
				}
				if(!this.timeout){
					this.timeout=$timeout(onNotificationTimeEnd.bind(this), NOTIFICATION_TIME);					
				}
			};
			onNotificationTimeEnd = function(){
				this.current=null;
				this.timeout=null;
				if(this.notifications.length>0){
					this.notify();
				}
			};
			$window.notifiy = this.notify.bind(this);
		});
}());