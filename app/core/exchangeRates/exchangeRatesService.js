(function () {
    'use strict';

    angular.module('app.exchangeRatesService', ['app.dataStorageService'])

            .factory('exchangeRatesService', exchangeRatesService);

    exchangeRatesService.$inject = ['dataStorageService', '$q'];

    function exchangeRatesService(dataStorageService, $q) {
        return {
            getExchangeRates: getExchangeRates
        };

        function getExchangeRates(condition) {
            var deferred = $q.defer();

            dataStorageService.getExchangeRates(condition)
                    .then(getSuccess, getFailure);

            function getSuccess(exchangeRates) {
                deferred.resolve(exchangeRates.data);
            }

            function getFailure(error) {
                deferred.reject(error.data);
            }

            return deferred.promise;
        }
    }
})();
