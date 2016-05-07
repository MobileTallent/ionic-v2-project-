function likeAll(profiles) {
	var promises = []
	for(let profile of profiles)
		promises.push(ParseService.processProfile(profile, true))
	return $q.all(promises)
}

it('it should create and match a few users', (done) => {
	var location = {latitude:10, longitude: 10}
	var profile
	var searchParams = {location:location, distance:25, 'ageFrom':18, 'ageTo':55, guys:true, girls:true }
	var birthdate = new Date(new Date().getFullYear() - 25, 0, 1) // 25 years old

	var match, msg1, msg2

	ParseService.signUp(e2e.user1.email, e2e.user1.password)
		.then(result => ParseService.getProfile())
		.then(result => profile = result)
		.then(profile => ParseService.saveProfile(profile, {enabled:true, gender:'M', guys:true, birthdate:birthdate, location:location, name:'user1', about:'about1'}))
		.then(profile => ParseService.logout())

		.then(() => ParseService.signUp(e2e.user2.email, e2e.user2.password))
		.then(result => ParseService.getProfile())
		.then(result => profile = result)
		.then(result => ParseService.saveProfile(profile, {enabled:true, gender:'M', guys:true, birthdate:birthdate, location:location, name:'user2', about:'about2'}))

		.then(profile => ParseService.searchProfiles(searchParams))
		.then(profiles => likeAll(profiles))
		.then(match => ParseService.logout())

		.then(() => ParseService.logIn(e2e.user1.email, e2e.user1.password))
		.then(() => ParseService.searchProfiles(searchParams))
		.then(profiles => likeAll(profiles))
		.then(result => ParseService.logout())

		.then(() => ParseService.logIn(e2e.user2.email, e2e.user2.password))
		.then(() => ParseService.searchProfiles(searchParams))
		.then(profiles => likeAll(profiles))
		.then(result => ParseService.logout())

		.then(() => ParseService.logIn(e2e.user3.email, e2e.user3.password))
		.then(() => ParseService.searchProfiles(searchParams))
		.then(profiles => likeAll(profiles))
		.then(result => ParseService.logout())

		.then(null, errorFn)
		.finally(done)
})
