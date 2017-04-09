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
            var currencies = [];

            dataStorageService.getRatesNBP()
                    .then(getRatesNBPSuccess, getRatesFailure);

            dataStorageService.getRatesECB()
                    .then(getRatesECBSuccess, getRatesFailure);

            function getRatesNBPSuccess(rateData) {
                for (var i = 0; i < rateData.data[0].rates.length; i++) {
                    currencies.push({'targetCurrencyName': rateData.data[0].rates[i].currency, 'targetCurrencyCode': rateData.data[0].rates[i].code, 'baseCurrencyCode': 'ZL'});
                }

                deferred.resolve(currencies);
            }

            function getRatesECBSuccess(rateData) {
                var xml2json = new X2JS();
                var afterConversion = xml2json.xml_str2json(rateData.data);

                for (var i = 3; i < afterConversion.Structure.Structures.Codelists.Codelist[1].Code.length; i++) {
                    if (afterConversion.Structure.Structures.Codelists.Codelist[1].Code[i]._id.match(/\d+/g) === null) {
                        currencies.push({'targetCurrencyName': afterConversion.Structure.Structures.Codelists.Codelist[1].Code[i].Name.__text, 'targetCurrencyCode': afterConversion.Structure.Structures.Codelists.Codelist[1].Code[i]._id, 'baseCurrencyCode': 'EUR'});
                    }
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
