(function () {
    'use strict';

    angular.module('app', [
        'ui.router',
        'app.nav.breadcrumbs',
        'app.nav.footer',
        'app.nav.header',
        'app.nav.menu',
        'app.exrat',
        'app.subscription',
        'app.directives.about',
        'ui.multiselect'
    ]);
})();
