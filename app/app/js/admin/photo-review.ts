module app {

    interface ProfilePhoto {
        profile: IProfile
        file: IFile
    }

    export class PhotoReview {

        public profilePhotos: ProfilePhoto[] = []

        constructor(private $ionicPopup, private $log:ng.ILogService, private $scope:ng.IScope, private $ionicHistory,
                    private $state, private $stateParams, private AppService:IAppService, private AppUtil:AppUtil) {

            $scope.$on('$ionicView.beforeEnter', () => this.refresh())
        }

        public refresh() {
            this.AppUtil.blockingCall(
                this.AppService.getProfilesWithPhotosToReview(),
                profiles => {
                    this.$log.log('loaded ' + profiles.length + ' profiles with photos to review')
                    profiles.forEach(profile =>
                        profile.photosInReview.forEach(file =>
                            this.profilePhotos.push({profile:profile, file:file}))
                    )
                })
        }

        public reviewPhoto(profile, file, approved) {
            console.log('controller reviewPhoto ', profile, file, approved)
            this.AppUtil.blockingCall(
                this.AppService.reviewPhoto(profile.id, file.url(), approved),
                () => {
                    this.$log.log('photo review success')
                    // Remove the one we just reviewed
                    this.profilePhotos.splice(_.findIndex(this.profilePhotos, pf => pf.file.url() === file.url()), 1)
                })
        }

    }

    PhotoReview.$inject = ['$ionicPopup', '$log', '$scope', '$ionicHistory', '$state', '$stateParams', 'AppService', 'AppUtil']
    angular.module('controllers').controller('PhotoReview', PhotoReview)
}
