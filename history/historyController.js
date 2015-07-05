
angular.module('app').controller('HistoryController', function(HistoryService, Video, $http, $scope){
	var t = this;
	this.timeline = new Array();
	this.endOfHistoryReached = false;
	
	this.tlDays = 1;
	day = 1000*60*60*24; // 1 day in ms
	
	$scope.updating = 0;
	
	this.addPage = function(){
		this.incTlDays();
	};
	
	var tlLimit = function(){
		return (new Date()).getTime() - t.tlDays*day;
	};
	
	this.incTlDays = function(){
		t.tlDays = t.tlDays + 1;
		t.update();
	};
	
	this.update = function(){
		
		$scope.updating = $scope.updating + 1;
		
		HistoryService.getHistory(function(storedHistory){
			
			//console.log("history", storedHistory);
			
			$scope.$apply(function(){
				
				t.timeline = new Array();
				
				// ∃ subscription s: end of s.history not reached ⇒ end of history not reached
				var endOfHistoryReached = true;
				
				Object.keys(storedHistory).forEach(function(channelId){
					var l = tlLimit();
					var h = storedHistory[channelId];
					
					for(i = h.length-1, first = h.length; i>=0 && h[i].date > l; i=i-1){
						first = i;
					}
					
					if(first > 0) endOfHistoryReached = false; // end of history NOT reached for this subscription
					
					lastEntries = h.slice(first);
					
					lastEntries.forEach(function(entry){
						t.timeline.unshift(Video.fromHistoryObject(entry));
					});
					
				});
				
				t.endOfHistoryReached = endOfHistoryReached;
				if(endOfHistoryReached){
					console.log("endOfHistoryReached");
				}
				
				t.timeline.sort(function(e1,e2){return e2.date-e1.date;});
				
				console.log("timeline ready");
				
				$scope.updating = $scope.updating - 1;
			});
		});
	};
	
	$scope.update = this.update;
	
								// p in ms
	function getLastByPeriod(h, p){
		first = h.length;
	
		for(i = h.length-1; i>=0 && h[i].date > p; i=i-1){
			first = i;
		}
	
		return h.slice(first);
	};
	
	this.restore = function(entry){
		HistoryService.restoreHistoryEntry(entry);
		//? SubscriptionService.restore(entry);
	};
	
});






