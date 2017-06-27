module app {

	import IPromise = Parse.IPromise;
	/**
	 * AppService will implement this when converted to TypeScript
	 */
	export interface IAppService {
		twilioAccessToken: string

		goToNextLoginState(): void

		requestLocationServices(): ng.IPromise<void>
		getCurrentPosition(): ng.IPromise<ILocation>
		saveProfile(updates: IProfile): ng.IPromise<IProfile>
		getProfile(): IProfile
		getProfileOfSelectedUser(profileId: string): IProfile
		getProfileByUserId(id: string): IProfile
		getProfilesWhoLikeMe(): ng.IPromise<IProfile[]>
		processMatch(profile: IProfile, liked: boolean): ng.IPromise<IMatch>
		getProfileSearchResults(): IProfile[]

		reportProfile(reason: string, profile: IProfile, match?: IMatch): ng.IPromise<void>

		getUnreadChatsCount(): number
		getPeopleWhoLikesMeCount(): number
		getProfileNew(): ng.IPromise<IProfile[]>

		// Admin functions
		getReportedUsers(): ng.IPromise<IReport[]>
		getReportedUserDetails(report): ng.IPromise<IReportDetails>
		deletePhoto(reportId: string, photoUrl): ng.IPromise<void>
		banUser(userId: string): ng.IPromise<void>
		closeReport(reportId: string, action: string): ng.IPromise<void>
		searchUsersByEmail(email: string): ng.IPromise<IUser[]>
		loadUser(id: string): ng.IPromise<IUser>
		deleteUser(userId: string): ng.IPromise<void>
		searchUsersByName(name: string): ng.IPromise<IProfile[]>
		getProfilesWithPhotosToReview(): ng.IPromise<IProfile[]>
		reviewPhoto(profileId: string, fileUrl: string, approved: boolean): ng.IPromise<void>
		addClinicsQuestion(clinicQuestion: any): ng.IPromise<void>
		getClinicsQuestion(): ng.IPromise<IClinicsQuestion[]>
		delClinicsQuestion(id: string): ng.IPromise<void>
		addFindUs(findUs: any): ng.IPromise<void>
		getFindUs(): ng.IPromise<IFindUs[]>
		delFindUs(id: string): ng.IPromise<void>
		addFindUsReport(findUsVote: any): ng.IPromise<void>
		getFindUsReport(): ng.IPromise<IFindUsReport[]>
		delFindUsReport(id: string): ng.IPromise<void>
		getMatchesReport(numDays: number): ng.IPromise<IMatch[]>
		getChatMessageReport(numDays: number): ng.IPromise<IChatMessage[]>
	}

	/**
	 * The object type returned from IAppService.getReportedUserDetails()
	 */
	export interface IReportDetails {
		allReports: IReport[]
		recentMessages: IChatMessage[]
		recentMessagesToReporter: IChatMessage[]
	}


	// Partially defined
	export interface IParseService {
		init(): ng.IPromise<void>
		getUserId(): string
		sendChatMessage(message: IChatMessage, match: IMatch): ng.IPromise<IChatMessage>
		getTwilioToken(): ng.IPromise<string>
		rebuildMatches(): ng.IPromise<void>
	}

	// Partially defined
	export interface ILocalDBService {
		init(): ng.IPromise<void>
		getUnreadChats(): ng.IPromise<any>
		setChatRead(chatId: string, read: boolean): ng.IPromise<void>
		saveChatMessage(msg: IChatMessage, match: IMatch): ng.IPromise<boolean>
	}
}
