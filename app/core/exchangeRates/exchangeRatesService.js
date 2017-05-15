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

        function getExchangeRates(currencies, startDate, endDate, page, size) {
            var promises = [];
            var itemArray = [];

            for (var i in currencies) {
                var deferred = $q.defer();
                var promise;
                if (currencies[i].baseCurrencyCode === 'PLN') {
                    promise = dataStorageService.getExchangeRatesNBP(currencies[i].targetCurrencyCode, startDate, endDate, page, size)
                            .then(getSuccess, getFailure);
                } else if (currencies[i].baseCurrencyCode === 'EUR') {
                    promise = dataStorageService.getExchangeRatesECB(currencies[i].targetCurrencyCode, startDate, endDate, page, size)
                            .then(getSuccess, getFailure);
                }
                promises.push(promise);
            }

            return $q.all(promises)
                    .then(function () {
                        return deferred.promise;
                    });

            function getSuccess(exchangeRates) {
                itemArray.push(exchangeRates.data);
                deferred.resolve(itemArray);
            }

            function getFailure(error) {
                deferred.reject(error.data);
            }
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
