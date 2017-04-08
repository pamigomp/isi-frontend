(function () {
    'use strict';

    angular.module('app.subscriptionService', ['app.dataStorageService'])

            .factory('subscriptionService', subscriptionService);

    subscriptionService.$inject = ['dataStorageService', '$q'];

    function subscriptionService(dataStorageService, $q) {
        return {
            postSubscription: postSubscription,
            getRatesList: getRatesList
        };

        function postSubscription(subscription) {
            var deferred = $q.defer();

            dataStorageService.postSubscription(subscription)
                    .then(postSuccess, postFailure);

            function postSuccess() {
                deferred.resolve();
            }

            function postFailure(error) {
                deferred.reject(error.data);
            }

            return deferred.promise;
        }

        function getRatesList() {
            var deferred = $q.defer();

            dataStorageService.getRates()
                    .then(getRatesSuccess, getRatesFailure);

            function getRatesSuccess(rateData) {
                var currencies = [];
                for (var i = 0; i < rateData.data[0].rates.length; i++) {
                    currencies.push({'targetCurrencyName': rateData.data[0].rates[i].currency, 'targetCurrencyCode': rateData.data[0].rates[i].code, 'baseCurrencyCode': 'ZL'});
                }

                deferred.resolve(currencies);
            }

            function getRatesFailure() {
                deferred.reject();
            }

            return deferred.promise;
        }
    }
})();
