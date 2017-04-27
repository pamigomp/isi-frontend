(function () {
    'use strict';

    angular.module('app.subscription', ['app.subscriptionService', 'ui.select', 'ngSanitize', 'app.filters.props'])

            .controller('subscriptionController', subscriptionController);

    subscriptionController.$inject = ['subscriptionService'];

    function subscriptionController(subscriptionService) {
        var vm = this;

        vm.periodsList = [
            {
                'name': 'codziennie',
                'value': 'DAILY'
            },
            {
                'name': 'co tydzień',
                'value': 'WEEKLY'
            },
            {
                'name': 'co miesiąc',
                'value': 'MONTHLY'
            }
        ];
        vm.loadCurrenciesList = loadCurrenciesList;
        vm.subscribe = subscribe;
        vm.clear = clear;

        function loadCurrenciesList() {
            vm.errorLoadingCurrencies = false;
            vm.loadingCurrencies = true;

            subscriptionService.getCurrenciesList()
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

        function subscribe(subscription) {
            vm.errorSendingSubscription = false;
            vm.sendingSubscription = true;
            vm.subscribed = false;

            subscriptionService.postSubscription(subscription)
                    .then(postSubscriptionSuccess, postSubscriptionFailure);

            function postSubscriptionSuccess() {
                vm.subscribed = true;
                vm.errorSendingSubscription = false;
                vm.sendingSubscription = false;
            }

            function postSubscriptionFailure(errorData) {
                vm.errorSubscribing = errorData;
                vm.subscribed = false;
                vm.errorSendingSubscription = true;
                vm.sendingSubscription = false;
            }
        }

        function clear() {
            vm.contact = {};
            vm.errorSendingSubscription = false;
            vm.subscribed = false;
        }
    }
})();
