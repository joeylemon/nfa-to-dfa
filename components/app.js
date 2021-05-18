const app = angular.module('app', ['ngRoute'])

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'components/home/HomeView.html',
            controller: 'HomeController'
        })
        .otherwise({
            redirectTo: '/'
        })
}])
