// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('first', {
     url: '/first',
     templateUrl: 'templates/first.html',
     controller: 'FirstCtrl'
    })
  .state('second', {
     url: '/first',
     templateUrl: 'templates/second.html',
     controller: 'SecondCtrl'
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/first');
})
.controller('FirstCtrl',function($rootScope, $cordovaCapture, $cordovaCamera, $scope, $state, $scope){

    $scope.recordVideo = function(){
  var options = { limit: 1, duration: 20 };
  $cordovaCapture.captureVideo(options).then(function(videoData) {
        $rootScope.currentVideoPath = videoData[0].fullPath;
        $state.go("second");
  }, function(err){

  });

}
}).controller('SecondCtrl',function($scope, $window, $cordovaSocialSharing, $rootScope, $cordovaCapture, $cordovaCamera, $ionicPopup, $ionicLoading, $cordovaFileTransfer){

$scope.vid_height = ($window.innerHeight / 2) ;
$scope.vid_width = $window.innerWidth;

    $scope.recordVideo = function(){
  var options = { limit: 1, duration: 20 };
  $cordovaCapture.captureVideo(options).then(function(videoData) {
        $rootScope.currentVideoPath = videoData[0].fullPath;
         var video = document.getElementById('video_to_upload');
         video.src = videoData[0].fullPath;
         video.play();

  }, function(err){

  });

}

$scope.share = function(){
/* $cordovaSocialSharing
    .share("message", "subject", $rootScope.currentVideoPath, "shdc") // Share via native share sheet
    .then(function(result) {
      // Success!
      console.log(result);
    }, function(err) {
      // An error occured. Show a message to the user
      console.log(err);
    });*/

    var filePath = getCorrectFilePath();
    doUploadToYoutube(filePath);
}

function getCorrectFilePath(){
       var fileName  = $rootScope.currentVideoPath;
    if (ionic.Platform.isAndroid()) {
      if(fileName.substring(0, 4) != "file"){
       
       fileName = "file:/"+fileName;
      }
  } else if (ionic.Platform.isIOS()) {

}
  
  return fileName;
}

function doUploadToYoutube(videoPath){
      $ionicLoading.show({
              content: 'Processing please wait',
              animation: 'fade-in',
              showBackdrop: true,
              showDelay: 0
          });

     var options = {
            fileKey: "video",
            fileName: "will_be_provided_by_user"+".mp4",
            chunkedMode: false,
            mimeType: "video/mp4"
        };

    $cordovaFileTransfer.upload("http://sandboxserver.co.za/upload_to_youtube.php", videoPath, options, true)
      .then(function(result) {
        console.log(result.response);
        $ionicLoading.hide();
        //var res = result.response;
       // var json = JSON.stringify(result.response);
        var res = JSON.parse(result.response);
        if(typeof res["status"] != "undefined" && typeof res["status"] != null){           
           $ionicPopup.alert({
        title: "Successfull",
        template: "Video Successfully uploaded. Thanks you for sharing!<br> Link:<b>"+res["video_url"]
         }).then(function (result) {
       });
        }else{
                $ionicPopup.alert({
        title: "Error",
        template: "Upload failed please try again"
         }).then(function (result) {
       });
        }
      

      }, function(err) {
        // Error
         console.log("ERROR: " + JSON.stringify(err));
            $ionicPopup.alert({
        title: "Error",
        template: "Upload failed please try again"
         }).then(function (result) {
       });
      }, function (progress) {
        // constant progress updates
      });
}

});