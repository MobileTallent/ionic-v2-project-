module app {
	export class ServiceDetail {

		public service;
		public form;
		public submitted = false

		static $inject = ['$stateParams', '$ionicHistory', '$sce', 'AppService', '$ionicLoading', '$timeout', '$ionicPopup', 'AppUtil']
		constructor(private $stateParams, public $ionicHistory, private $sce, public AppService,
		private $ionicLoading, private $timeout, private $ionicPopup, public AppUtil) {

			this.service = this.$stateParams.service
			if (this.service.video) this.service.video_new = this.$sce.trustAsResourceUrl(this.service.video)
			this.AppService.increaseShowClick({'type':'service', 'behavior':'click', 'obj': this.service.toJSON()})

			this.form = {
				'pid':this.service.pid,
				'uid':this.AppService.user.id,
				'sid':this.service.id,
				'service_name':this.service.title,
				'name':this.AppService.profile.name,
				'image_cover':this.AppService.profile.photos[0]._url,
				'has_read':false,
				'u_email':this.AppService.user.getEmail(),
				'u_phone':'',
				'u_skype':'',
				'message':''
			}
		}

		public get_service = (form) => {
			this.submitted = true
            if (form.$valid) {

                console.log('enquire before send', this.form)
                this.AppUtil.blockingCall(
                    this.AppService.addEnquire(this.form),
                    () => {
                        this.AppUtil.toastSimple('Request sended!')
						this.$ionicHistory.goBack();
                    })
            }
		};
	}

	angular.module('ionicApp').controller('ServiceDetail', ServiceDetail)
}
