const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (req, res) => {
	if (!req.body.password || req.body.password.length < 3) {
		return res.status(400).json({ error: 'password must be atleast 3 characters' })
	}
	const saltRounds = 10
	const passwordHash = await bcrypt.hash(req.body.password, saltRounds)

	const user = new User({
		username: req.body.username,
		name: req.body.name,
		passwordHash
	})

	const savedUser = await user.save()
	res.status(201).json(savedUser)
})

usersRouter.get('/', async (req, res) => {
	const users = await User
		.find({}).populate('blogs', { user: 0, likes: 0 })
	res.json(users.map(user => user.toJSON()))
})

module.exports = usersRouter