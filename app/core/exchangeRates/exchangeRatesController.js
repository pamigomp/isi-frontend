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
            }
        ];
        vm.categories = [];
        vm.dataset = [];
        vm.loadCurrenciesList = loadCurrenciesList;
        vm.refreshExchangeRates = refreshExchangeRates;

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
                condition = !condition;
                getExchangeRates();
            }, 5000);
        }

        $scope.$on('$destroy', function () {
            if (intervalPromise) {
                $interval.cancel(intervalPromise);
            }
        });

        $scope.$watch('ERC.selectedRates', function () {
            generateChart();
        });

//        vm.attrs = {
//            'caption': 'Sales - 2012 v 2013',
//            'numberprefix': '$',
//            'plotgradientcolor': '',
//            'bgcolor': 'FFFFFF',
//            'showalternatehgridcolor': '0',
//            'divlinecolor': 'CCCCCC',
//            'showvalues': '0',
//            'showcanvasborder': '0',
//            'canvasborderalpha': '0',
//            'canvasbordercolor': 'CCCCCC',
//            'canvasborderthickness': '1',
//            'yaxismaxvalue': '30000',
//            'captionpadding': '30',
//            'linethickness': '3',
//            'yaxisvaluespadding': '15',
//            'legendshadow': '0',
//            'legendborderalpha': '0',
//            'palettecolors': '#f8bd19,#008ee4,#33bdda,#e44a00,#6baa01,#583e78',
//            'showborder': '0'
//        };
    }
})();
