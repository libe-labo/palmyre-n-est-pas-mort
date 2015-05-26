'use strict';

var app = angular.module('app', ['lheader']);

app.controller('Ctrl', ['$scope', '$timeout', function($scope, $timeout) {
    // Create sample data
    $scope.data = _.range(50);

    // Utility function returning a new Masonry instance
    var callMasonry = function() {
        return new Packery($('.masonry')[0], {
            itemSelector : '.item',
            percentPosition : true
        });
    };

    var msnry = callMasonry();

    // Update everything when $scope.data.length changes
    $scope.$watch(function() { return $scope.data.length; }, function() {
        $timeout(function() {
            $('.item').off('click');
            $('.item').on('click', function(event) {
                var element = $(event.target);
                if (!element.hasClass('item')) { // Make sure we select
                    element = element.parents('.item'); // the right element
                }

                element.toggleClass('expanded');

                $scope.$apply(function() { // Make sure we're in an applied scope
                    msnry.layout(); // Re-layout
                });
            });

            msnry.destroy();
            msnry = callMasonry();
        }, 10); // Must fire this in a timeout (or the DOM will not be ready)

    }, true);
}]);
