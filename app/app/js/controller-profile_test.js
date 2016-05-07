describe('controllers.ProfileEdit', function() {

	var $log, $rootScope, AppService, AppUtil, ProfileEdit, profile, camera, $translate

	var photo1 = { url: () => "1.png"}
	var photo2 = { url: () => "2.png"}
	var photo3 = { url: () => "3.png"}

	const ABOUT_ORIG = 'aaa'
	const ABOUT_NEW = 'bbccdd'

	beforeEach(function() {
		module('controllers', function($provide) {

			profile = { about: ABOUT_ORIG, photos: [photo1, photo2] }

			AppService = {
				getProfile: () => profile,
				saveProfile: (profileUpdate) => _.assign(profile, profileUpdate)
			}
			$provide.value('AppService', AppService)

			mockAppUtil($provide)
			mock$translate($provide)

			camera = {}
			$provide.value('$cordovaCamera', camera)
		})

		inject(function($controller, _$log_, _$rootScope_) {
			$log = _$log_
			$rootScope = _$rootScope_
			ProfileEdit = $controller('ProfileEdit', { $scope: $rootScope.$new() })

			// $ionic.beforeEnter event calls this
			ProfileEdit.refresh()
		})

	})


	it('Check a new ProfileEdit', inject(() => {
		expect(ProfileEdit.photos.length).toBe(2)
		expect(ProfileEdit.selectedCount()).toBe(0)
		expect(ProfileEdit.photos[0].file.url()).toBe('1.png')
		expect(ProfileEdit.photos[1].file.url()).toBe('2.png')
		expect(ProfileEdit.about).toBe(ABOUT_ORIG)
	}))

	it('Test update about', inject(() => {
		ProfileEdit.about = ABOUT_NEW
		ProfileEdit.saveProfile()

	}))

	it('Test toggle selected and selected count', inject(() => {
		ProfileEdit.toggleSelected(ProfileEdit.photos[0])
		expect(ProfileEdit.selectedCount()).toBe(1)
		ProfileEdit.toggleSelected(ProfileEdit.photos[1])
		expect(ProfileEdit.selectedCount()).toBe(2)
		ProfileEdit.toggleSelected(ProfileEdit.photos[0])
		expect(ProfileEdit.selectedCount()).toBe(1)
		ProfileEdit.toggleSelected(ProfileEdit.photos[1])
		expect(ProfileEdit.selectedCount()).toBe(0)
	}))

	it('Test swap', inject(() => {
		ProfileEdit.toggleSelected(ProfileEdit.photos[0])
		ProfileEdit.toggleSelected(ProfileEdit.photos[1])
		ProfileEdit.swapPhotos()
		expect(ProfileEdit.selectedCount()).toBe(0)
		expect(ProfileEdit.photos[0].file.url()).toBe('2.png')
		expect(ProfileEdit.photos[1].file.url()).toBe('1.png')
	}))

	it('Test delete', inject(() => {
		ProfileEdit.toggleSelected(ProfileEdit.photos[0])
		ProfileEdit.deletePhotos()
		expect(ProfileEdit.selectedCount()).toBe(0)
		expect(ProfileEdit.photos.length).toBe(1)
		// the others should shuffle down
		expect(ProfileEdit.photos[0].file.url()).toBe('2.png')

		ProfileEdit.toggleSelected(ProfileEdit.photos[0])
		ProfileEdit.deletePhotos()
		expect(ProfileEdit.photos.length).toBe(0)
	}))

	it('Take a picture', inject(($q) => {
		// mock the call to cordovaCamera
		camera.getPicture = (options) => $q.resolve('base64')
		// TODO
	}))

})