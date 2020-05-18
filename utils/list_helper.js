const lodash = require('lodash')

const dummy = () => {
	return 1
}

const totalLikes = blogs => {
	const likes = blogs.map(blog => blog.likes)
	const reducer = (acc, current) => acc + current
	return likes.reduce(reducer, 0)
}

const favoriteBlog = blogs => {
	const likes = blogs.map(blog => blog.likes)
	const reducer = (max, current) => Math.max(max, current)
	return blogs[likes.indexOf(likes.reduce(reducer, -Infinity))]
}

const mostBlogs = blogs => {
	const most = lodash(blogs).countBy('author').toPairs().orderBy([1], ['desc']).value()
	return (
		{
			author: most[0][0],
			blogs: most[0][1]
		}
	)
}

const mostLikes = blogs => {
	const most = lodash(blogs)
		.groupBy('author')
		.mapValues((authorsBlogs) => totalLikes(authorsBlogs))
		.toPairs()
		.orderBy([1], ['desc'])
		.value()
	return (
		{
			author: most[0][0],
			likes: most[0][1]
		}
	)
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes
}