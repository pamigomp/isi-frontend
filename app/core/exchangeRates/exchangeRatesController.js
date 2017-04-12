(function () {
    'use strict';

    angular.module('app.exrat', ['app.exchangeRatesService', 'ui.select', 'ngSanitize', 'app.filters.props', 'ng-fusioncharts'])

            .controller('exchangeRatesController', exchangeRatesController);

    exchangeRatesController.$inject = ['exchangeRatesService', '$interval', '$scope'];

    function exchangeRatesController(exchangeRatesService, $interval, $scope) {
        var vm = this;

        var condition = false;
        var intervalPromise;
        var allExchangeRates;

        vm.selectedCurrencies = [
            {
                baseCurrencyCode: 'PLN',
                targetCurrencyCode: 'EUR',
                targetCurrencyName: 'euro'
            },
            {
                baseCurrencyCode: 'PLN',
                targetCurrencyCode: 'USD',
                targetCurrencyName: 'dolar amerykański'
            }
        ];
        vm.attrs = {
            'caption': 'Wykres aktualnych kursów walut',
            'bgcolor': '#e7e7e7',
            'showalternatehgridcolor': '0',
            'divlinecolor': 'CCCCCC',
            'vDivLineColor': 'CCCCCC',
            'showvalues': '1',
            'vline': true,
            'yaxisvaluespadding': '15',
            'numVDivLines': 5,
            'vDivLineDashed': '0'
        };
        vm.categories = [];
        vm.dataset = [];
        vm.loadCurrenciesList = loadCurrenciesList;
        vm.refreshExchangeRates = refreshExchangeRates;
        vm.getExchangeRates = getExchangeRates;

        function loadCurrenciesList() {
            vm.errorLoadingCurrencies = false;
            vm.loadingCurrencies = true;

            exchangeRatesService.getCurrenciesList()
                    .then(getCurrenciesListSuccess, getCurrenciesListFailure);

            function getCurrenciesListSuccess(currenciesList) {
                vm.currenciesList = currenciesList;
                vm.errorLoadingCurrencies = false;
                vm.loadingCurrencies = false;
            }

            function getCurrenciesListFailure(errorData) {
                vm.errorGettingCurrencies = errorData;
                vm.errorLoadingCurrencies = true;
                vm.loadingCurrencies = false;
            }
        }

        function getExchangeRates() {
            condition = !condition;
            vm.errorLoadingExchangeRates = false;
            vm.loadingExchangeRates = true;

            exchangeRatesService.getExchangeRates(condition)
                    .then(getExchangeRatesSuccess, getExchangeRatesFailure);

            function getExchangeRatesSuccess(exchangeRates) {
                allExchangeRates = exchangeRates;
                generateChart();
                vm.errorLoadingExchangeRates = false;
                vm.loadingExchangeRates = false;
            }

            function getExchangeRatesFailure(errorData) {
                vm.errorGettingExchangeRates = errorData;
                vm.errorLoadingExchangeRates = true;
                vm.loadingExchangeRates = false;
            }
        }

        function generateChart() {
            var category2 = [];
            clearChart();

            angular.forEach(vm.selectedCurrencies, function (selectedRate) {
                angular.forEach(allExchangeRates, function (exchangeRate) {
                    if (selectedRate.targetCurrencyCode === exchangeRate.targetCurrencyCode && selectedRate.baseCurrencyCode === exchangeRate.baseCurrencyCode) {
                        var seriesname = exchangeRate.targetCurrencyCode + ' -> ' + exchangeRate.baseCurrencyCode;
                        var found2 = vm.dataset.some(function (data) {
                            return data.seriesname === seriesname;
                        });
                        if (!found2) {
                            vm.dataset.push({
                                'seriesname': seriesname,
                                'data': exchangeRate.currencyData
                            });
                        }
                        angular.forEach(exchangeRate.currencyData, function (currencyData) {
                            var found = category2.some(function (category) {
                                return category.label === currencyData.effectiveDate;
                            });
                            if (!found) {
                                category2.push({
                                    'label': currencyData.effectiveDate
                                });
                            }
                        });
                    }
                }
                );
            });

            vm.categories.push({
                'category': category2
            });
        }

        function clearChart() {
            vm.dataset.splice(0, vm.dataset.length);
            vm.categories.splice(0, vm.categories.length);
        }

        function refreshExchangeRates() {
            getExchangeRates();
            intervalPromise = $interval(function () {
                getExchangeRates();
            }, 10000);
        }

        $scope.$on('$destroy', function () {
            if (intervalPromise) {
                $interval.cancel(intervalPromise);
            }
        });

        $scope.$watch('ERC.selectedCurrencies', function () {
            generateChart();
        });
    }
})();
