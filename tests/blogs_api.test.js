const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
/**
 * wraps app.js into a superagent-object (https://github.com/visionmedia/superagent)
 * enabling HTTP-requests while testing
 */
const api = supertest(app)

beforeEach(async () => {
	await User.deleteMany({})
	const passwordHash = await bcrypt.hash('root', 10)
	const user = new User({ name: 'testuser', username: 'testimies', passwordHash })
	await user.save()

	const testUser = await helper.usersInDB()

	const blogs = await helper.initialBlogs.map(blog => {
		return ({
			...blog,
			user: testUser[0].id
		})
	})

	await Blog.deleteMany({})
	await Blog.insertMany(blogs)
})

/**
 * GET method tests
 */
describe('returned blogs', () => {
	test('are json', async () => {
		await api
			.get('/api/blogs')
			.expect(200) //supertest expect
			.expect('Content-Type', /application\/json/) //supertest expect
	})

	test(`length is ${helper.initialBlogs.length} blogs`, async () => {
		const response = await api.get('/api/blogs')
		expect(response.body).toHaveLength(helper.initialBlogs.length)
	})

	test('have an id field and not an _id field', async () => {
		const response = await api.get('/api/blogs')
		response.body.map(blog => blog.id).forEach(id => expect(id).toBeDefined())
		response.body.map(blog => blog._id).forEach(_id => expect(_id).not.toBeDefined())
	})

	test('have an user field', async () => {
		const response = await helper.blogsInDB()
		response.map(blog => blog.user).forEach(user => expect(user).toBeDefined())
	})

	test('have a populated user field', async () => {
		const response = await api
			.get('/api/blogs')
		const blogs = response.body
		const users = blogs.map(blog => blog.user)
		users.map(user => user.username).forEach(username => expect(username).toBeDefined())
		users.map(user => user.name).forEach(name => expect(name).toBeDefined())
		users.map(user => user.id).forEach(id => expect(id).toBeDefined())
	})
})

/**
 * POST method tests
 */
describe('POSTing a blog', () => {
	test('adds the specific blog to DB', async () => {
		const newBlog = {
			title: 'Tuntematon Sotilas, post-irony-remix',
			author: 'Wayne Castle',
			url: 'https://safe-stream-70600.herokuapp.com/',
			likes: 0
		}
		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const response = await helper.blogsInDB()
		expect(response).toHaveLength(helper.initialBlogs.length + 1)

		const titles = response.map(blog => blog.title)
		expect(titles).toContain('Tuntematon Sotilas, post-irony-remix')
	})

	test('without likes defaults to likes === 0', async () => {
		const newBlog = {
			title: 'Täällä pohjantähden alla, generation-remix-remix',
			author: 'Wayne Castle',
			url: 'https://safe-stream-70600.herokuapp.com/'
		}
		const response = await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		expect(response.body.likes).toEqual(0)
	})

	test('without title AND url results in Bad request', async () => {
		const newBlog = {
			author: 'Akon (so lonely)'
		}

		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(400)
	})

})

test('delete removes a blog if id is valid', async () => {
	const blogsAtStart = await helper.blogsInDB()

	await api
		.delete(`/api/blogs/${blogsAtStart[0].id}`)
		.expect(204)

	const blogs = await helper.blogsInDB()
	expect(blogs.length).toBe(blogsAtStart.length - 1)
})

test('PUT updates a blog', async () => {
	const blogsAtStart = await helper.blogsInDB()

	const newBlog = { ...blogsAtStart[0], likes: blogsAtStart[0].likes + 1 }

	await api
		.put(`/api/blogs/${blogsAtStart[0].id}`)
		.send(newBlog)
		.expect(200)
		.expect('Content-Type', /application\/json/)

	const blogs = await helper.blogsInDB()

	expect(blogs.find(blog => blog.id.toString() === blogsAtStart[0].id.toString()).likes).toBe(blogsAtStart[0].likes + 1)
})

afterAll(() => mongoose.connection.close())