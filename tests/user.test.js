const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const helper = require('./test_helper')
const User = require('../models/user')
/**
 * wraps app.js into a superagent-object (https://github.com/visionmedia/superagent)
 * enabling HTTP-requests while testing
 */
const api = supertest(app)

beforeEach(async () => {
	await User.deleteMany({})

	const passwordHash = await bcrypt.hash('root', 10)
	const user = new User({ username: 'root', passwordHash })
	await user.save()
})

describe('user creation:', () => {
	test('a valid user can be created', async () => {
		const newUser = {
			username: 'superuser',
			password: 'root',
			name: 'Testeri'
		}
		await api
			.post('/api/users')
			.send(newUser)
			.expect(201) //supertest expect
			.expect('Content-Type', /application\/json/) //supertest expect

		const users = await helper.usersInDB()
		expect(users).toHaveLength(2)
		expect(users.map(user => user.name)).toContain(newUser.name)
	})

	test('a non unique user create results in a proper error', async () => {
		const newUser = {
			username: 'root',
			password: 'root'
		}
		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)

		expect(result.body.error).toContain('`username` to be unique')
		const users = await helper.usersInDB()
		expect(users).toHaveLength(1)
	})

	test('too short pw results in a proper error', async () => {
		const newUser = {
			username: '2_shorty',
			password: 'ot'
		}
		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)

		expect(result.body.error).toContain('password must be atleast 3 characters')
		const users = await helper.usersInDB()
		expect(users).toHaveLength(1)
	})

	test('too short username results in a proper error', async () => {
		const newUser = {
			username: '2_',
			password: 'troot'
		}
		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)

		expect(result.body.error).toContain('User validation failed')
		const users = await helper.usersInDB()
		expect(users).toHaveLength(1)
	})
})

test('a list of users can be retrieved', async () => {
	await api
		.get('/api/users')
		.expect(200)
		.expect('Content-Type', /application\/json/)
})

afterAll(() => mongoose.connection.close())