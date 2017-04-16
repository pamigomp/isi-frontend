(function () {
    'use strict';

    angular.module('app.exrat', ['app.exchangeRatesService', 'ui.select', 'ngSanitize', 'app.filters.props', 'ng-fusioncharts'])

            .controller('exchangeRatesController', exchangeRatesController);

    exchangeRatesController.$inject = ['exchangeRatesService', '$interval', '$scope'];

    function exchangeRatesController(exchangeRatesService, $interval, $scope) {
        var vm = this;

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
        vm.selectedPeriod = "1";
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

            exchangeRatesService.getExchangeRates()
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

                selectPeriod();
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

            angular.forEach(vm.selectedCurrencies, function (selectedRate) {
                angular.forEach(allExchangeRates, function (exchangeRate) {
                    if (selectedRate.targetCurrencyCode === exchangeRate.targetCurrencyCode && selectedRate.baseCurrencyCode === exchangeRate.baseCurrencyCode) {
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
                    }
                }
                );
            });

            vm.categories.push({
                'category': categoryTemp
            });
        }

        function selectPeriod() {
            if (vm.selectedPeriod === "1") {
                angular.forEach(vm.dataset, function (data) {
                    while (data.data.length - 24 > 0) {
                        data.data.splice(0, data.data.length - 24);
                    }
                });
                angular.forEach(vm.categories, function (category) {
                    while (category.category.length - 24 > 0) {
                        category.category.splice(0, category.category.length - 24);
                    }
                });
            }
            if (vm.selectedPeriod === "7") {
                angular.forEach(vm.dataset, function (data) {
                    while (data.data.length - 168 > 0) {
                        data.data.splice(0, data.data.length - 168);
                    }
                });
                angular.forEach(vm.categories, function (category) {
                    while (category.category.length - 168 > 0) {
                        category.category.splice(0, category.category.length - 168);
                    }
                });
            }
            if (vm.selectedPeriod === "30") {
                angular.forEach(vm.dataset, function (data) {
                    while (data.data.length - 720 > 0) {
                        data.data.splice(0, data.data.length - 720);
                    }
                });
                angular.forEach(vm.categories, function (category) {
                    while (category.category.length - 720 > 0) {
                        category.category.splice(0, category.category.length - 720);
                    }
                });
            }
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
                generateChart();
            }
        });

        $scope.$watch('ERC.selectedPeriod', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                generateChart();
            }
        });
    }
})();
