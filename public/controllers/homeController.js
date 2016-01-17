
var myApp = angular.module("myApp", ["ngFileUpload"]);

myApp.controller("HomeCtrl", ["$scope", "$http", "$timeout", "Upload", homeController]);

function homeController($scope, $http, $timeout, Upload) {
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
    
    $scope.userFiles = [];
    $scope.filesCurrentlyShowing = [];
    $scope.mine = true;
    $scope.private = false;
    $scope.uploading = false;
    $scope.uploadPerc = 0;
    $scope.currentlyVisiting = null;
    $scope.fileOrder = "filename";
    
    //Load files from ejs
    var files = window.files;
    files.forEach(function(file) {
        file.formattedSize = formatSize(file.size);
    });
    $scope.userFiles = files;
    $scope.showPublic();
    
    $scope.searchUsers = function() {
        if($scope.searchString.length > 0) {
            $http.get("/searchUsers/" + $scope.searchString).then(function(response) {
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
    
    $scope.visitUser = function(username) {
        console.log("a");
        $http.get("/public/" + username).then(function(response) {
            console.log(response);
            response.data.forEach(function(file) {
                file.formattedSize = formatSize(file.size);
            });
            $scope.userFiles = response.data;
            $scope.filesCurrentlyShowing = response.data;
            $scope.mine = false;
            $scope.cancelSearch();
            $scope.currentlyVisiting = username;
            
            //Initialize tabs (Public & Private)
            $timeout(function() {
                $('ul.tabs').tabs();
            }, 50);
        });
    };
    
    $scope.visitSelf = function() {
        $http.get("/private").then(function(response) {
            response.data.forEach(function(file) {
                file.formattedSize = formatSize(file.size);
            });
            $scope.userFiles = response.data;
            $scope.showPublic();
            $scope.mine = true;
            $scope.cancelSearch();
            $scope.currentlyVisiting = null;
            
            //Initialize tabs (Public & Private)
            $timeout(function() {
                $('ul.tabs').tabs();
            }, 50);
        });
    };
    
    $scope.visitSelf();
    
    $scope.showPublic = function() {
        $scope.filesCurrentlyShowing = jQuery.grep($scope.userFiles, function(file) {
            return !file.private;
        });
        
        $scope.private = false;
    };
    
    $scope.showPrivate = function() {
        $scope.filesCurrentlyShowing = jQuery.grep($scope.userFiles, function(file) {
            return file.private;
        });
        
        $scope.private = true;
    };
    
    $scope.download = function(file) {
        var hiddenElement = document.createElement("a");

        hiddenElement.href = "/file/" + file._id;
        hiddenElement.target = '_blank';
        hiddenElement.download = file.filename;
        hiddenElement.click();
    };
    
    $scope.remove = function(file) {
        $http.post("/remove", { fileId: file._id }).then(function(response) {
            console.log(response);
            if(response.status == 200) {
                var index = $scope.userFiles.indexOf(file);
                if(index > -1)
                    $scope.userFiles.splice(index, 1);
                
                index = $scope.filesCurrentlyShowing.indexOf(file);
                if(index > -1)
                    $scope.filesCurrentlyShowing.splice(index, 1);
            }
        });
    };
    
    $scope.sortFilesBy = function(property) {
        if($scope.fileOrder == property)
            $scope.fileOrder = "-" + property;
        else
            $scope.fileOrder = property;
    };
    
    $scope.initNavbar = function() {
        $(".button-collapse").sideNav();
    };
    
    //
    // 
    //
    
    // Upload stuff
    $scope.upload = function (files) {
        if (files && files.length) {
            files.forEach(function(file) {
                if (!file.$error) {
                    $scope.uploading = true;
                    Upload.upload({
                        url: '/upload',
                        data: {
                            file: file
                        },
                        headers: {
                            private: $scope.private
                        }
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.uploadPerc = progressPercentage;
                    }).success(function (data, status, headers, config) {
                        $timeout(function() {
                            $http.get("/private").then(function(response) {
                                $scope.userFiles = response.data;
                                if($scope.private)
                                    $scope.showPrivate();
                                else
                                    $scope.showPublic();
                                
                                $scope.uploading = false;
                            });
                        });
                    });
                }
            });
        }
    };
};