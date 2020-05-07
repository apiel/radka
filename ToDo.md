- typescript, see about tsconfig in dev project to fix linting issues

- try to use something else than Parcel, dev mode doesnt work well
    + or maybe https://parceljs.org/api.html

- use config in babel file

- deploy: zeit (server function), heroku, netlify, aws?

- might want to use config to support some extra assets extensions

- find a way to separate bundle, for a single page using a framework. Let's imagine most of our page are purely static html with a little bit of vanillaJs but for a specific page, for example the admin dashboard of the website, we use react. We would need to have a way to load react, only for this dashboard and not for in the other statics pages

- imporve hot reload
    + babel faster
    + use parcel server