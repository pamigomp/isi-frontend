(function () {
    'use strict';

    angular.module('app.dataStorageService', [])
            .factory('dataStorageService', dataStorageService);

    dataStorageService.$inject = ['$http'];

    function dataStorageService($http) {
        return {
            getExchangeRatesNBP: getExchangeRatesNBP,
            getExchangeRatesECB: getExchangeRatesECB,
            postSubscription: postSubscription,
            getCurrenciesNBP: getCurrenciesNBP,
            getCurrenciesECB: getCurrenciesECB
        };

        function getExchangeRatesNBP(currency, startDate, endDate, page, size) {
            return $http({
                method: 'GET',
                url: 'https://isi-backend.herokuapp.com/api/exchange/v1/nbp/exchange_rates?' +
                        'currency=' + currency +
                        '&startDate=' + startDate +
                        '&endDate=' + endDate +
                        '&page=' + page +
                        '&size=' + size
            });
        }

        function getExchangeRatesECB(currency, startDate, endDate, page, size) {
            return $http({
                method: 'GET',
                url: 'https://isi-backend.herokuapp.com/api/exchange/v1/ecb/exchange_rates?' +
                        'currency=' + currency +
                        '&startDate=' + startDate +
                        '&endDate=' + endDate +
                        '&page=' + page +
                        '&size=' + size
            });
        }

        function postSubscription(subscription) {
            return $http({
                method: 'POST',
                url: 'https://isi-backend.herokuapp.com/api/exchange/v1/subscribe',
                data: subscription
            });
        }

        function getCurrenciesNBP() {
            return $http({
                method: 'GET',
                url: 'https://api.nbp.pl/api/exchangerates/tables/a/'
            });
        }

        function getCurrenciesECB() {
            return $http({
                method: 'GET',
                url: 'https://sdw-wsrest.ecb.europa.eu/service/datastructure/ECB/ECB_EXR1/1.0?references=children'
            });
        }
    }
})();
