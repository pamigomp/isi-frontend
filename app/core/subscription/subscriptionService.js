(function () {
    'use strict';

    angular.module('app.subscriptionService', ['app.dataStorageService'])

            .factory('subscriptionService', subscriptionService);

    subscriptionService.$inject = ['dataStorageService', '$q'];

    function subscriptionService(dataStorageService, $q) {
        return {
            postSubscription: postSubscription,
            getRatesList: getRatesList,
            getPeriodsList: getPeriodsList
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
                deferred.resolve(rateData.data);
            }

            function getRatesFailure() {
                deferred.reject();
            }

            return deferred.promise;
        }

        function getPeriodsList() {
            var deferred = $q.defer();

            dataStorageService.getPeriods()
                    .then(getPeriodsSuccess, getPeriodsFailure);

            function getPeriodsSuccess(periodData) {
                deferred.resolve(periodData.data);
            }

            function getPeriodsFailure() {
                deferred.reject();
            }

            return deferred.promise;
        }
    }
})();
