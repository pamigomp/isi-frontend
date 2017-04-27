(function () {
    'use strict';

    angular.module('app.exchangeRatesService', ['app.dataStorageService'])

            .factory('exchangeRatesService', exchangeRatesService);

    exchangeRatesService.$inject = ['dataStorageService', '$q', '$filter'];

    function exchangeRatesService(dataStorageService, $q, $filter) {
        return {
            getExchangeRates: getExchangeRates,
            getCurrenciesList: getCurrenciesList
        };

        function getExchangeRates(currencies, period) {
            var today = new Date();
            var previousDay = new Date(today);
            previousDay.setDate(today.getDate() - 1);
            var previousWeek = new Date(today);
            previousWeek.setDate(today.getDate() - 7);
            var previousMonth = new Date(today);
            previousMonth.setMonth(today.getMonth() - 1);

            var endDate = $filter('date')(today, "yyyy-MM-dd");
            var startDate;

            if (period === "DAILY") {
                startDate = $filter('date')(previousDay, "yyyy-MM-dd");
            } else if (period === "WEEKLY") {
                startDate = $filter('date')(previousWeek, "yyyy-MM-dd");
            } else if (period === "MONTHLY") {
                startDate = $filter('date')(previousMonth, "yyyy-MM-dd");
            }

            var promises = [];
            var itemArray = [];

            for (var i in currencies) {
                var deferred = $q.defer();
                var promise;
                if (currencies[i].baseCurrencyCode === "PLN") {
                    promise = dataStorageService.getExchangeRatesNBP(currencies[i].targetCurrencyCode, startDate, endDate)
                            .then(getSuccess, getFailure);
                } else if (currencies[i].baseCurrencyCode === "EUR") {
                    promise = dataStorageService.getExchangeRatesECB(currencies[i].targetCurrencyCode, startDate, endDate)
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
