module app {

	export interface IAppRootScope extends ng.IRootScopeService {
		facebookConnected: boolean
		appVersion: string
		cropPhoto: string
	}


	/**
	 * This interface mirrors the Parse.File API to allow compatibility with using Parse or a custom backend
	 */
	export interface IFile {
		/**
		 * Gets the url of the file.
		 * @method url
		 */
		url: () => string
		/**
		 * Gets the name of the file.
		 * @method name
		 */
		name: () => string
	}

	export interface ILocation {
		longitude: number
		latitude: number
	}

	/**
	 * This interface mirrors the Parse.Object API to allow compatibility with using Parse or a custom backend
	 */
	export interface IBase {

		/** The primary key of the object */
		id: string

		/** The date the object was created */
		createdAt: Date

		/** The date the object was last updated */
		updatedAt: Date
	}

	/**
	 * @typedef {Object} User
	 */
	export interface IUser extends IBase {
		/**
		 * undefined if the email verification is not required,
		 * false if verification is still required
		 * true if verified
		 */
		emailVerified: boolean

		/** An array of the ids of the Match objects which are a mutual match */
		matches: string[]

		/** The profile for this user */
		profile: IProfile

		/** The status of the user account, eg banned, deleting. undefined by default. */
		status: string

		/** If the user is an administrator */
		admin: boolean

		/** If the user has a premium account (e.g. in-app purchase/subscription) */
		premium: boolean

		/** The number of credits a user has (e.g. from in-app purchase) */
		credits: number
	}

	/**
	 *
	 */
	export interface IProfile extends IBase {

		/** @property {string} uid - the id of the user who's profile this is */
		uid: string


		// Profile data

		/** The first name of the user */
		name: string

		/** The birthdate of the user */
		birthdate: Date

		/** The age of the user in years */
		age: number

		/** The gender of the user. 'M' or 'F' is supported */
		gender: string

		/** Some information the user has provided about themself */
		about: string

		/** The user profile photos */
		photos: IFile[]

		/**
		 * The user profile photos that are awaiting review by admin/moderators. '
		 * Must be set undefined if there are none to enable the Parse.Query.exists() call to work when querying for them.
		 */
		photosInReview: IFile[]

		/** If the user should show up in potential matches for other users */
		enabled: boolean

		/** The geo location of the user */
		location: ILocation


		// Search filters

		/** How far to search for potential matches in kilometers */
		distance: number

		/** If the user wants males to show up in their search results */
		guys: boolean

		/** If the user wants females to show up in their search results */
		girls: boolean

		/** The minimum age of people the user wants to show in their search results */
		ageFrom: number

		/** The minimum age of people the user wants to show in their search results */
		ageTo: number


		// App Settings

		/** If the location is from the GPS (otherwise manually set) */
		gps: boolean

		/** The type of the property distance. Either 'km' for kilometers or 'mi' for miles */
		distanceType: string

		/** Whether to play a sound on a new match */
		notifyMatch: boolean

		/** Whether to play a sound on a new chat message */
		notifyMessage: boolean

		// Self Identification filters

		/* Refers to the category of the person 
		 * 1 - Individual
		 * 2 - Partner
		 * 3 - Organization
		 * */
		personCategory: string

		/* Refers to the type of the person 
		 * 0 - N/A or undefined
		 * 1 - Curious
		 * 2 - Serious
		 * */
		personType: string

		/** If the user has a lot of sperm */
		personSperm: boolean

		/** If the user has eggs */
		personEgg: boolean

		/** If the user has womb */
		personWomb: boolean

		/** If the user has embryo */
		personEmbryo: boolean
		
		/* Refers to the helping level of the person 
		 * 0 - N/A or undefined
		 * 1 - consider helping someone maybe
		 * 2 - primarily here to help others
		 * 3 - not able to help others at all
		 * */
		personHelpLevel: string

		//Search Filters for the Self-Id cards

		/** Looking for People with Sperm */
		LFSperm: boolean

		/** Looking for People with Eggs */
		LFEggs: boolean

		/** Looking for People with Womb */
		LFWomb: boolean

		/** Looking for People with Embryo */
		LFEmbryo: boolean

		/** Looking for People w/o any of the above */
		LFNot: boolean

		/** Looking for People who wants to help me */
		LFHelpM: boolean

		/** Looking for People whom I can help */
		LFHelpO: boolean

	}

	export interface IChat extends IBase {

	}

	export interface IMatch extends IChat {
		/** The date when the profiles matched */
		matchedDate: Date
	}

	export interface IChatMessage extends IBase {
		/** The match/chat this message is for */
		match: IMatch
		/** The users in the chat at the time of sending the message */
		userIds: string[]
		/** The id of the user who sent the message */
		sender: string
		/** The name of the user who sent the message */
		senderName: string
		text: string
		image: IFile
		audio: IFile
	}

	export interface IReport extends IBase {
		/** The user who submitted the report */
		reportedBy: IUser
		/** The user who was reported */
		reportedUser: IUser
		/** (optional) the Match/Chat being reported about if already a mutual match */
		match: IMatch
		/** The Profile of the user being reported */
		profile: IProfile
		/** (optional) A particular photo URL that was reported */
		photo: string
		/** The reason for reporting */
		reason: string
		/** What action was taken by the admin (e.g. delete photo, warn, none, ban user) */
		actionTaken: string
		/** The admin user which took the action */
		actionUser: IUser
	}

	export interface IClinicsQuestion extends IBase {
		/** The header question */
		question: string
		/** The answer from the question */
		answer: string
		/** The position of the question */
		position: number
		/** The type if for male , female or generic question */
		type: string
		/** URL of Youtube video */
		video: string
	}

	export interface IFindUs extends IBase {
		/** The name */
		name: string
	}

	export interface IAboutJab extends IBase {
		/** The message */
		message: string
		/** The name */
		videoId: string
	}

	export interface IFindUsReport extends IBase {
		/** The name of the voted group */
		name: string
		/** The name of the person */
		username: string
		/** The state */
		checked: boolean
	}
}
