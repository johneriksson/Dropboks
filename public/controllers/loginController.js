
var myApp = angular.module("myApp", ["ngMaterial", "ngMdIcons"]);

myApp.controller("LoginCtrl", ["$scope", "$mdSidenav", function($scope, $mdSidenav) {
    
    $scope.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };
    
    $scope.menu = [
        {
            link: '/home',
            title: 'Home',
            icon: 'home'
        },
        {
            link: '/myfiles',
            title: 'My files',
            icon: 'work'
        }
    ];
    
    $scope.admin = [
        {
            link: '/settings',
            title: 'Settings',
            icon: 'settings'
        },
        {
            link: '/logout',
            title: 'Log out',
            icon: 'logout'
        }
    ];
    
}]);

myApp.config(function($mdThemingProvider) {
    var customBlueMap = $mdThemingProvider.extendPalette('light-blue', {
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50'],
        '50': 'ffffff'
    });
    
    $mdThemingProvider.definePalette('customBlue', customBlueMap);
    
    $mdThemingProvider.theme('default')
        .primaryPalette('customBlue', {
        'default': '500',
        'hue-1': '50'
    }).accentPalette('pink');
    
    $mdThemingProvider.theme('input', 'default').primaryPalette('grey');
});