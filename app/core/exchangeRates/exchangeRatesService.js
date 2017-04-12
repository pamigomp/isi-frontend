(function () {
    'use strict';

    angular.module('app.exchangeRatesService', ['app.dataStorageService'])

            .factory('exchangeRatesService', exchangeRatesService);

    exchangeRatesService.$inject = ['dataStorageService', '$q'];

    function exchangeRatesService(dataStorageService, $q) {
        return {
            getExchangeRates: getExchangeRates,
            getCurrenciesList: getCurrenciesList
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

            function getCurrenciesFailure() {
                deferred.reject();
            }

            return deferred.promise;
        }
    }
})();
