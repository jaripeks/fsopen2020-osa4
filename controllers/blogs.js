const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const authenticator = require('../utils/middleware').authenticator

blogsRouter.get('/', async (req, res) => {
	const blogs = await Blog
		.find({}).populate('user', { blogs: 0 })
	res.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', authenticator, async (req, res) => {
	const user = await User.findById(req.decodedToken.id)

	const blog = new Blog({
		...req.body,
		likes: req.body.likes ? req.body.likes : 0,
		user: user._id
	})

	const result = await blog.save()
	user.blogs = user.blogs.concat(result._id)
	await user.save()

	res.status(201).json(result.toJSON())
})

blogsRouter.delete('/:id', authenticator, async (req, res) => {
	const blogToDelete = await Blog.findById(req.params.id)

	if (blogToDelete.user.toString() === req.decodedToken.id.toString()) {
		await Blog.findByIdAndDelete(req.params.id)
		return res.status(204).end()
	}

	return res.status(401).json({ error: 'cannot delete blogs created by a different user' })
})

blogsRouter.put('/:id', async (req, res) => {
	const blog = {
		title: req.body.title,
		author: req.body.author,
		url: req.body.url,
		likes: req.body.likes ? req.body.likes : 0
	}

	const updated = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
	res.status(200).json(updated.toJSON())
})

module.exports = blogsRouter