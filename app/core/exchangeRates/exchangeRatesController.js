(function () {
    'use strict';

    angular.module('app.exrat', ['ngAnimate', 'chart.js', 'app.exchangeRatesService'])

            .controller('exchangeRatesController', exchangeRatesController);

    exchangeRatesController.$inject = ['exchangeRatesService', '$interval', '$scope'];

    function exchangeRatesController(exchangeRatesService, $interval, $scope) {
        var vm = this;

        var condition = false;
        var intervalPromise;

        vm.refreshExchangeRates = refreshExchangeRates;

        function getExchangeRates() {
            vm.errorLoadingRates = false;
            vm.loadingRates = true;

            exchangeRatesService.getExchangeRates(condition)
                    .then(getExchangeRatesSuccess, getExchangeRatesFailure);

            function getExchangeRatesSuccess(exchangeRates) {
                vm.labels = exchangeRates[0].days;
                vm.series = exchangeRates[0].series;
                vm.data = exchangeRates[0].values;
                vm.errorLoadingRates = false;
                vm.loadingRates = false;
            }

            function getExchangeRatesFailure(errorData) {
                vm.errorGettingRates = errorData;
                vm.errorLoadingRates = true;
                vm.loadingRates = false;
            }
        }

        function refreshExchangeRates() {
            getExchangeRates();
            intervalPromise = $interval(function () {
                condition = !condition;
                getExchangeRates();
            }, 3000);
        }

        $scope.$on('$destroy', function () {
            if (intervalPromise) {
                $interval.cancel(intervalPromise);
            }
        });
    }
})();
