(function () {
    'use strict';

    angular.module('app.dataStorageService', [])
            .factory('dataStorageService', dataStorageService);

    dataStorageService.$inject = ['$http'];

    function dataStorageService($http) {
        return {
            getExchangeRates: getExchangeRates,
            postSubscription: postSubscription,
            getRates: getRates
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
                url: 'http://api.nbp.pl/api/exchangerates/tables/a/'
            });
        }
    }
})();
