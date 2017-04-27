(function () {
    'use strict';

    angular.module('app.exrat', ['app.exchangeRatesService', 'ui.select', 'ngSanitize', 'app.filters.props', 'ng-fusioncharts'])

            .controller('exchangeRatesController', exchangeRatesController);

    exchangeRatesController.$inject = ['exchangeRatesService', '$interval', '$scope'];

    function exchangeRatesController(exchangeRatesService, $interval, $scope) {
        var vm = this;

        var intervalPromise;
        var allExchangeRates = [];

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
        vm.selectedPeriod = "DAILY";
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
        vm.categories = [{'category': []}];
        vm.dataset = [{}];
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
            vm.errorLoadingExchangeRates = false;
            vm.loadingExchangeRates = true;

            exchangeRatesService.getExchangeRates(vm.selectedCurrencies, vm.selectedPeriod)
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
            clearChart();

            if (vm.selectedCurrencies.length !== 0) {
                selectCurrencies();
            }
        }

        function clearChart() {
            vm.dataset.splice(0, vm.dataset.length);
            vm.categories.splice(0, vm.categories.length);
            if (vm.selectedCurrencies.length === 0) {
                vm.dataset = [{}];
                vm.categories = [{'category': []}];
            }
        }

        function selectCurrencies() {
            var categoryTemp = [];

            angular.forEach(allExchangeRates, function (exchangeRate) {
                var seriesname = exchangeRate.targetCurrencyCode + ' -> ' + exchangeRate.baseCurrencyCode;
                var foundData = vm.dataset.some(function (data) {
                    return data.seriesname === seriesname;
                });
                if (!foundData) {
                    var index = vm.dataset.push({
                        'seriesname': seriesname
                    });
                    vm.dataset[index - 1].data = angular.copy(exchangeRate.currencyData);
                }
                angular.forEach(exchangeRate.currencyData, function (currencyData) {
                    var foundCategory = categoryTemp.some(function (category) {
                        return category.label === currencyData.effectiveDate;
                    });
                    if (!foundCategory) {
                        categoryTemp.push({
                            'label': currencyData.effectiveDate
                        });
                    }
                });
            });

            vm.categories.push({
                'category': categoryTemp
            });
        }

        function refreshExchangeRates() {
            getExchangeRates();
            intervalPromise = $interval(function () {
                getExchangeRates();
            }, 360000);
        }

        $scope.$on('$destroy', function () {
            if (intervalPromise) {
                $interval.cancel(intervalPromise);
            }
        });

        $scope.$watch('ERC.selectedCurrencies', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                getExchangeRates();
            }
        });

        $scope.$watch('ERC.selectedPeriod', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                getExchangeRates();
            }
        });
    }
})();
