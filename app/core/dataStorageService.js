(function () {
    'use strict';

    angular.module('app.dataStorageService', [])
            .factory('dataStorageService', dataStorageService);

    dataStorageService.$inject = ['$http'];

    function dataStorageService($http) {
        return {
            getExchangeRates: getExchangeRates,
            postSubscription: postSubscription,
            getRates: getRates,
            getPeriods: getPeriods
        };

        function getExchangeRates(condition) {
            if (condition) {
                return $http({
                    method: 'GET',
//                url: 'http://localhost:8080/isi/exchangeRates'
                    url: 'assets/data/exchangeRates.json'
                });
            } else {
                return $http({
                    method: 'GET',
//                url: 'http://localhost:8080/isi/exchangeRates'
                    url: 'assets/data/exchangeRates2.json'
                });
            }
        }

        function postSubscription(subscription) {
            return $http({
                method: 'POST',
                url: 'http://localhost:8080/isi/exchangeRates',
                data: subscription
            });
        }

        function getRates() {
            return $http({
                method: 'GET',
//                url: 'http://localhost:8080/isi/rates'
                url: 'assets/data/rates.json'
            });
        }

        function getPeriods() {
            return $http({
                method: 'GET',
//                url: 'http://localhost:8080/isi/periods'
                url: 'assets/data/periods.json'
            });
        }
    }
})();
