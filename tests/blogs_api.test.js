const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
/**
 * wraps app.js into a superagent-object (https://github.com/visionmedia/superagent)
 * enabling HTTP-requests while testing
 */
const api = supertest(app)

const allBlogs = [
	{
		title: 'React patterns',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
		likes: 7
	},
	{
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
		likes: 5
	},
	{
		title: 'Canonical string reduction',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
		likes: 12
	},
	{
		title: 'First class tests',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
		likes: 10
	},
	{
		title: 'TDD harms architecture',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
		likes: 0
	},
	{
		title: 'Type wars',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
		likes: 2
	}
]

beforeEach(async () => {
	await Blog.deleteMany({})
	await Blog.insertMany(allBlogs)
})

test('blogs are returned as json', async () => {
	await api
		.get('/api/blogs')
		.expect(200) //supertest expect
		.expect('Content-Type', /application\/json/) //supertest expect
})

test(`there are ${allBlogs.length} blogs`, async () => {
	const response = await api.get('/api/blogs')
	expect(response.body).toHaveLength(allBlogs.length)
})

afterAll(() => mongoose.connection.close())