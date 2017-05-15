(function () {
    'use strict';

    angular.module('app.exrat', ['app.exchangeRatesService', 'ui.select', 'ngSanitize', 'app.filters.props', 'ng-fusioncharts'])

            .controller('exchangeRatesController', exchangeRatesController);

    exchangeRatesController.$inject = ['exchangeRatesService', '$interval', '$scope', '$filter'];

    function exchangeRatesController(exchangeRatesService, $interval, $scope, $filter) {
        var vm = this;

        var intervalPromise;
        vm.allExchangeRates = [];

        var page = 0;
        var size;
        var endDate;
        var startDate;

        var today = new Date();
        vm.today = new Date();
        vm.today.setDate(new Date().getDate() - 1);
        vm.endDate = new Date();
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
        vm.selectedPeriod = 'WEEKLY';
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

        function getExchangeRates(state) {
            vm.errorLoadingExchangeRates = false;
            vm.loadingExchangeRates = true;

            if (state === 'base') {
                calculateBasePeriod();
            } else if (state === 'prev') {
                calculateChangedPeriod(state);
            } else if (state === 'next') {
                calculateChangedPeriod(state);
            }

            exchangeRatesService.getExchangeRates(vm.selectedCurrencies, startDate, endDate, page, size)
                    .then(getExchangeRatesSuccess, getExchangeRatesFailure);

            function getExchangeRatesSuccess(exchangeRates) {
                vm.allExchangeRates = exchangeRates;
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

        function calculateBasePeriod() {
            var previousDay = new Date(today);
            previousDay.setDate(today.getDate() - 1);
            var previousWeek = new Date(today);
            previousWeek.setDate(today.getDate() - 7);
            var previousMonth = new Date(today);
            previousMonth.setMonth(today.getMonth() - 1);

            endDate = $filter('date')(today, 'yyyy-MM-dd');

            if (vm.selectedPeriod === 'DAILY') {
                startDate = $filter('date')(previousDay, 'yyyy-MM-dd');
                size = 2;
            } else if (vm.selectedPeriod === 'WEEKLY') {
                startDate = $filter('date')(previousWeek, 'yyyy-MM-dd');
                size = 7;
            } else if (vm.selectedPeriod === 'MONTHLY') {
                startDate = $filter('date')(previousMonth, 'yyyy-MM-dd');
                size = 30;
            }
            vm.endDate = today;
        }

        function calculateChangedPeriod(state) {
            var partsStartDate = startDate.split('-');
            var partsEndDate = endDate.split('-');
            var startDateTemp = new Date(parseInt(partsStartDate[0], 10),
                    parseInt(partsStartDate[1], 10) - 1,
                    parseInt(partsStartDate[2], 10));
            var endDateTemp = new Date(parseInt(partsEndDate[0], 10),
                    parseInt(partsEndDate[1], 10) - 1,
                    parseInt(partsEndDate[2], 10));

            if (vm.selectedPeriod === 'DAILY') {
                if (state === 'prev') {
                    startDateTemp.setDate(startDateTemp.getDate() - 1);
                    endDateTemp.setDate(endDateTemp.getDate() - 1);
                } else if (state === 'next') {
                    startDateTemp.setDate(startDateTemp.getDate() + 1);
                    endDateTemp.setDate(endDateTemp.getDate() + 1);
                }
                startDate = $filter('date')(startDateTemp, 'yyyy-MM-dd');
                endDate = $filter('date')(endDateTemp, 'yyyy-MM-dd');
                size = 2;
            } else if (vm.selectedPeriod === 'WEEKLY') {
                if (state === 'prev') {
                    startDateTemp.setDate(startDateTemp.getDate() - 7);
                    endDateTemp.setDate(endDateTemp.getDate() - 7);
                } else if (state === 'next') {
                    startDateTemp.setDate(startDateTemp.getDate() + 7);
                    endDateTemp.setDate(endDateTemp.getDate() + 7);
                }
                startDate = $filter('date')(startDateTemp, 'yyyy-MM-dd');
                endDate = $filter('date')(endDateTemp, 'yyyy-MM-dd');
                size = 7;
            } else if (vm.selectedPeriod === 'MONTHLY') {
                if (state === 'prev') {
                    startDateTemp.setMonth(startDateTemp.getMonth() - 1);
                    endDateTemp.setMonth(endDateTemp.getMonth() - 1);
                } else if (state === 'next') {
                    startDateTemp.setMonth(startDateTemp.getMonth() + 1);
                    endDateTemp.setMonth(endDateTemp.getMonth() + 1);
                }
                startDate = $filter('date')(startDateTemp, 'yyyy-MM-dd');
                endDate = $filter('date')(endDateTemp, 'yyyy-MM-dd');
                size = 30;
            }
            vm.endDate = endDateTemp;
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

            angular.forEach(vm.allExchangeRates, function (exchangeRate) {
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
            getExchangeRates('base');
            intervalPromise = $interval(function () {
                getExchangeRates('base');
            }, 360000);
        }

        $scope.$on('$destroy', function () {
            if (intervalPromise) {
                $interval.cancel(intervalPromise);
            }
        });

        $scope.$watch('ERC.selectedCurrencies', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                getExchangeRates('base');
            }
        });

        $scope.$watch('ERC.selectedPeriod', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                getExchangeRates('base');
            }
        });
    }
})();
