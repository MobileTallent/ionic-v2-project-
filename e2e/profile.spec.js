// Describe a feature
describe('Sign-in Controller', function() {

	it('Login', function() {
		browser.get('http://localhost:8100');

		element(by.model('credentials.email')).sendKeys(e2e.user1.email)
		element(by.model('credentials.password')).sendKeys(e2e.user1.password)
		element(by.id('login')).click()

		browser.wait(function() {
			return $('#menu-left').isPresent() // keeps waiting until this statement resolves to true
		}, 15000) // need to wait 10s for GPS to potentially timeout and the time to login

		//var todoList = element.all(by.repeater('todo in todoList.todos'))
		//expect(todoList.count()).toEqual(3)
		//expect(todoList.get(2).getText()).toEqual('write first protractor test')
		//
		//// You wrote your first test, cross it off the list
		//todoList.get(2).element(by.css('input')).click()
		//var completedAmount = element.all(by.css('.done-true'))
		//expect(completedAmount.count()).toEqual(2)
	})

})