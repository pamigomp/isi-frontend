(function () {
    'use strict';

    angular.module('app.exrat', ['ngAnimate', 'chart.js', 'app.exchangeRatesService', 'ui.select', 'ngSanitize', 'app.filters.props'])

            .controller('exchangeRatesController', exchangeRatesController);

    exchangeRatesController.$inject = ['exchangeRatesService', '$interval', '$scope'];

    function exchangeRatesController(exchangeRatesService, $interval, $scope) {
        var vm = this;

        var condition = false;
        var intervalPromise;

        vm.loadRatesList = loadRatesList;
        vm.refreshExchangeRates = refreshExchangeRates;

        function loadRatesList() {
            vm.errorLoadingRates = false;
            vm.loadingRates = true;

            exchangeRatesService.getRatesList()
                    .then(getRatesListSuccess, getRatesListFailure);

            function getRatesListSuccess(ratesList) {
                vm.ratesList = ratesList;
                vm.errorLoadingRates = false;
                vm.loadingRates = false;
            }

            function getRatesListFailure(errorData) {
                vm.errorGettingRates = errorData;
                vm.errorLoadingRates = true;
                vm.loadingRates = false;
            }
        }

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
            }, 5000);
        }

        $scope.$on('$destroy', function () {
            if (intervalPromise) {
                $interval.cancel(intervalPromise);
            }
        });
    }
})();
