const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (req, res) => {
	const blogs = await Blog
		.find({}).populate('user', { blogs: 0 })
	res.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (req, res) => {
	const user = await User.findOne({})

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

blogsRouter.delete('/:id', async (req, res) => {
	await Blog.findByIdAndDelete(req.params.id)
	res.status(204).end()
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