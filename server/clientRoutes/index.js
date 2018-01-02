/* Routes for PubPub */
require('./communityCreate');	// Route: '/community/create'
require('./explore');			// Route: '/explore'
require('./pubRedirect');	// Route: '/pub/:slug'
require('./landing');			// Route: '/'

/* Routes for Communities */
require('./dashboard');			// Route: ['/dashboard', '/dashboard/:slug', '/dashboard/:slug/:mode']
require('./pubCreate');			// Route: '/pub/create'
require('./pubPresentation');	// Route: '/pub/:slug'
require('./collection'); 		// Route: ['/', '/:slug']
require('./collectionSubmit'); 	// Route: ['/:slug/submit', '/:slug/submit/:hash']

/* Routes for all */
require('./login'); 			// Route: '/login'
require('./privacy'); 			// Route: '/privacy'
require('./search'); 			// Route: '/search'
require('./terms'); 			// Route: '/tos'
require('./passwordReset'); 	// Route: ['/password-reset', '/password-reset/:resetHash/:slug']
require('./noMatch');			// Route: '/*'
