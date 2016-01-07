
var myApp = angular.module("myApp", ["ngFileUpload", "ngMaterial", "ngMdIcons"]);

myApp.controller("HomeCtrl", ["$scope", "$http", "$timeout", "Upload", "$mdSidenav", function($scope, $http, $timeout, Upload, $mdSidenav) {
    
    $scope.uploadFiles = function (files) {
        $scope.files = files;
        if (files && files.length) {
            Upload.upload({
                url: '/upload',
                data: {
                    files: files
                }
            }).then(function (response) {
                $timeout(function () {
                    $scope.result = response.data;
                });
            }, function (response) {
                if (response.status > 0) {
                    $scope.errorMsg = response.status + ': ' + response.data;
                }
            }, function (evt) {
                $scope.progress = 
                    Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
    };
    
    
    //
    //
    //
    
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.files = [$scope.file]; 
        }
    });
    $scope.log = '';

    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (!file.$error) {
                Upload.upload({
                    url: '/upload',
                    data: {
                      username: $scope.username,
                      file: file  
                    }
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.log = 'progress: ' + progressPercentage + '% ' +
                                evt.config.data.file.name + '\n' + $scope.log;
                }).success(function (data, status, headers, config) {
                    $timeout(function() {
                        $scope.log = 'file: ' + config.data.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                    });
                });
              }
            }
        }
    };
    
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