'use strict';

var app = angular.module('app', ['lheader', 'imagesLoaded']);

app.controller('Ctrl', ['$scope', '$timeout', '$http', '$sce', function($scope, $timeout, $http, $sce) {
    // Create sample data
    $scope.data = [];
    var allData = [];

    $http.get('data/data.csv').then(function(response) {
        var csvArray = CSVToArray(response.data);
        var csvHeader = _.first(csvArray.splice(0, 1));
        csvHeader = _.invert(csvHeader);

        for (var i = 0; i < csvArray.length; ++i) {
            allData.push({
                id : _.padLeft(csvArray[i][csvHeader.id], 4, '0'),
                credit : csvArray[i][csvHeader['crédit']],
                legend : $sce.trustAsHtml(csvArray[i][csvHeader['légende']]),
            });
        }

        allData = _.shuffle(allData);

        $scope.data = allData.splice(0, 100);

        msnry.destroy();
        msnry = callMasonry();
    });

    // Utility function returning a new Masonry instance
    var callMasonry = function() {
        return new Packery($('.masonry')[0], {
            itemSelector : '.item',
            percentPosition : true
        });
    };

    $scope.$on('PROGRESS', function() {
        msnry.layout();
    });

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

                var hasClass = element.hasClass('expanded');

                $('.item.expanded').removeClass('expanded');
                if (!hasClass) {
                    element.addClass('expanded');
                }

                $scope.$apply(function() { // Make sure we're in an applied scope
                    msnry.layout(); // Re-layout
                });
            });

            msnry.destroy();
            msnry = callMasonry();
        }, 400); // Must fire this in a timeout (or the DOM will not be ready)
    }, true);

    var $win = $(window);
    $(document).on('scroll', _.debounce(function() {
        if (allData.length <= 0) {
            $(document).off('scroll');
            return;
        }
        var scrollTop = $win.scrollTop();
        if ($win.height() + scrollTop === $(document).height()) {
            $scope.$apply(function() {
                $scope.data = $scope.data.concat(allData.splice(0, 100));
            });
            $timeout(function() {
                $win.scrollTop(scrollTop);
            }, 400);
        }
    }));
}]);
