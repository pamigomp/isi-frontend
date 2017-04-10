(function () {
    'use strict';

    angular.module('app.subscription', ['app.subscriptionService'])

            .controller('subscriptionController', subscriptionController);

    subscriptionController.$inject = ['subscriptionService'];

    function subscriptionController(subscriptionService) {
        var vm = this;

        vm.periodsList = [
            {
                'name': 'codziennie',
                'value': '1'
            },
            {
                'name': 'co tydzień',
                'value': '7'
            },
            {
                'name': 'co miesiąc',
                'value': '30'
            }
        ];
        vm.loadRatesList = loadRatesList;
        vm.subscribe = subscribe;
        vm.clear = clear;

        function loadRatesList() {
            vm.errorLoadingRates = false;
            vm.loadingRates = true;

            subscriptionService.getRatesList()
                    .then(getRatesListSuccess, getRatesListFailure);

            function getRatesListSuccess(ratesList) {
                vm.ratesList = ratesList;
                vm.errorLoadingRates = false;
                vm.loadingRates = false;
            }

            function getRatesListFailure(errorData) {
                vm.errorGettingRates = errorData;
                vm.errorLoadingRates = true;
                vm.loadingRates = false;
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
