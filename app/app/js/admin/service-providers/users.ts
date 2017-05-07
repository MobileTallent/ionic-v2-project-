module app {


	/**
	 * Controller
	 */
	export class Users {

		public users

		constructor(private $stateParams) {
			this.refresh()
		}

		public refresh() {
			this.users = this.$stateParams.users;
		}

	}

	Users.$inject = ['$stateParams']
	angular.module('controllers').controller('Users', Users)
}
