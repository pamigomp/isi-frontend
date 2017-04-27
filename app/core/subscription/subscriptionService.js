(function () {
    'use strict';

    angular.module('app.subscriptionService', ['app.dataStorageService'])

            .factory('subscriptionService', subscriptionService);

    subscriptionService.$inject = ['dataStorageService', '$q'];

    function subscriptionService(dataStorageService, $q) {
        return {
            postSubscription: postSubscription,
            getCurrenciesList: getCurrenciesList
        };

        function postSubscription(subscription) {
            var deferred = $q.defer();

            dataStorageService.postSubscription(subscription)
                    .then(postSuccess, postFailure);

            function postSuccess() {
                deferred.resolve();
            }

            function postFailure(error) {
                deferred.reject(error);
            }

            return deferred.promise;
        }

        function getCurrenciesList() {
            var deferred = $q.defer();
            var currencies = [];

            dataStorageService.getCurrenciesNBP()
                    .then(getCurrenciesNBPSuccess, getCurrenciesFailure);

            dataStorageService.getCurrenciesECB()
                    .then(getCurrenciesECBSuccess, getCurrenciesFailure);

            function getCurrenciesNBPSuccess(currencyData) {
                for (var i = 0; i < currencyData.data[0].rates.length; i++) {
                    currencies.push({
                        'targetCurrencyName': currencyData.data[0].rates[i].currency,
                        'targetCurrencyCode': currencyData.data[0].rates[i].code,
                        'baseCurrencyCode': 'PLN'
                    });
                }

                deferred.resolve(currencies);
            }

            function getCurrenciesECBSuccess(currencyData) {
                var xml2json = new X2JS();
                var afterConversion = xml2json.xml_str2json(currencyData.data);

                for (var i = 3; i < afterConversion.Structure.Structures.Codelists.Codelist[1].Code.length; i++) {
                    if (afterConversion.Structure.Structures.Codelists.Codelist[1].Code[i]._id.match(/\d+/g) === null) {
                        currencies.push({
                            'targetCurrencyName': afterConversion.Structure.Structures.Codelists.Codelist[1].Code[i].Name.__text,
                            'targetCurrencyCode': afterConversion.Structure.Structures.Codelists.Codelist[1].Code[i]._id,
                            'baseCurrencyCode': 'EUR'
                        });
                    }
                }

                deferred.resolve(currencies);
            }

            function getCurrenciesFailure(error) {
                deferred.reject(error);
            }

            return deferred.promise;
        }
    }
})();
