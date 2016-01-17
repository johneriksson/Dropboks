
var myApp = angular.module("myApp", []);

myApp.controller("UserCtrl", ["$scope", "$http", "$timeout", userController]);

function userController($scope, $http, $timeout) {
    
    //HELPER FUNCTIONS
    function round(number) {
        return Math.round(number * 10) / 10;
    }
    
    function formatSize(size) {
        if(size < 1024)
            return size + " B";
        else if (size < 1024 * 1024)
            return round(size / 1024) + " kB";
        else if (size < 1024 * 1024 * 1024)
            return round(size / (1024 * 1024)) + " MB";
        else
            return round(size / (1024 * 1024 * 1024)) + " GB";
    }
    
    //
    //
    //
    
    //Variables
    $scope.filesCurrentlyShowing = [];
    $scope.fileOrder = "filename";
    
    //
    //
    //
    
    //Scope functions
    $scope.searchUsers = function() {
        if($scope.searchString.length > 0) {
            $http.get("/api/searchUsers/" + $scope.searchString).then(function(response) {
                console.log(response);
                $scope.searchResult = response.data;
            });    
        } else {
            $scope.searchResult = null;
        }
    };
    
    $scope.cancelSearch = function() {
        $scope.searchResult = null;
    };
    
    $scope.download = function(file) {
        console.log(file);
        var hiddenElement = document.createElement("a");

        hiddenElement.href = "/file/" + file._id;
        hiddenElement.target = '_blank';
        hiddenElement.download = file.filename;
        hiddenElement.click();
    };
    
    $scope.sortFilesBy = function(property) {
        if($scope.fileOrder == property)
            $scope.fileOrder = "-" + property;
        else
            $scope.fileOrder = property;
    };
    
    //
    //
    //
    
    // INIT
    var files = window.files;
    files.forEach(function(file) {
        file.formattedSize = formatSize(file.size);
    });
    $scope.filesCurrentlyShowing = files;
    $(".button-collapse").sideNav();
    $('ul.tabs').tabs();
};