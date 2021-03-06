# THREE / Mithril / Typescript starter project

This is a somewhat opinionated, but hopefully open-ended starter project for web apps that have some combination of a canvas-based 3D scene and a DOM-based UI.

### [Online Demo](https://spacejack.github.io/three-mithril-ts/)

It leans heavily on **[THREE.js](https://threejs.org/)** for 3D graphics and **[Mithril.js](https://mithril.js.org/)** for a GUI framework and streams library.

It includes example techniques of mixing canvas and DOM elements, implementing a responsive layout and scalable 3D scene. And it shows how to use a canvas rendering engine alongside a virtual DOM library for UI.

Game architecture itself isn't really the focus here, but a servicable object-oriented skeleton is used for demonstration.

## Install

	npm install

### Recommended VS Code extensions:

* TSLint
* stylelint
* postcss-sugarss-language
* EditorConfig

## Compile-on-save ts and css files with source maps, start localhost server

Use this during development:

	npm start

Then go to `http://localhost:3000/` in your browser. Edits to source files will be automatically compiled on save and reloaded in the browser.

## Compile minified JS and CSS

Use this to create deployable files in `/public`:

	npm run build

Will output `public/css/app.css`, `public/js/app.js` and `public/js/vendor.js` bundles. You can then deploy the entire public folder to a web server.

## Why

If you come from a game development background, then managing HTML layouts and working with modern web frameworks may be a bit foreign, or even a nuisance task.

If you come from building web apps and aren't accustomed to doing real-time graphics at 60FPS then some of those concepts may also be foreign to you.

I like to work in as minimalist a way as possible. But not so minimal to the point that it hinders productivity. This is a setup and a collection of technologies and tools I've found strike a nice balance for small-to-medium sized projects.

What follows is a list of libraries and tools used, and some brief rationales.

## Libraries

### Mithril

Though not a big player in the world of front-end frameworks, Mithril can compete with the best of them. It's a VDOM-based framework, like React or Vue. It's small, it requires no additional tooling to use effectively, and its design makes for extremely simple redraw management. It also has the most ergonomic hyperscript syntax I've seen. It comes with a router, HTTP request lib and a tiny streams lib, all of which gzip down to about 10kb. In my opinion it's a perfect fit for game development, whether you only have a thin layer of DOM UI or if your game is heavily DOM-based and full of CSS animations.

Perhaps most importantly, Mithril has no opinions on and makes no requirements of how you manage your application state. Mithril redraws are tied to events rather than state changes, which means working with Mithril is much more like rendering a game scene than other UI libraries. You can opt-in or opt-out of its auto-redraw mechanism entirely, or on an as-needed basis.

### three.js

What can I say about this lib? The granddaddy of 3D libraries in the browser. It may be a bit on the heavy side but if you're going to be loading 3D meshes and textures, the size of the library will not likely be that siginificant. And even though it provides a relatively high-level API, it's still easy to get under the hood and control your rendering pipeline, write custom shaders or build your own vertex buffers. In terms of features, ongoing development and community, it has no real competition.

That said, if you prefer something else like PIXI for 2D, or a more barebones 3D library, it should be a straightforward replacement. Most graphics libraries simply need a canvas element to use as a render target.

## Build Tools

### Typescript

There are better articles out there to sell you on the value of static types but suffice it to say that Typescript is a compromise. Javascript is a deeply flawed language but at the same time you want as little friction as possible in order to leverage the wealth of available libraries. Adding static types is one of the easiest ways to catch errors early. They help navigate complex library APIs (like three.js) and make refactoring easy.

### PostCSS

There are a wide range of CSS preprocessors and tools out there. PostCSS's autoprefixer is invaluable, and since auto-prefixing is my number one CSS processor feature, I may as well leverage this ecosystem. By limiting ourselves to a subset of PostCSS plugins, we're pretty much just writing modern-future CSS rather than a completely different language. Plus the compiler is super fast and easy to configure.

### Browserify

It may seem a bit quaint and antique compared to Webpack these days, but Browserify is still vastly simpler to configure and maintain. It can do code splitting, hot module reloads, environment variables - pretty much everything I'd need from webpack. Why make things more complex than a few npm scripts?

Using the `npm-run-all` module allows us to create a set of simple scripts that do one thing, and then compose those into more complex scripts that can be run in sequence (`run-s`) or in parallel (`run-p`). `npm-run-all` allows us to write these kinds of scripts in a cross-platform friendly way.

Other bundling tools like Parcel may require zero configuration, but hide the inner workings. Using browserify everything is transparent and run via npm scripts. Rollup is another very nice bundling solution that focuses on optimized bundle sizes but as yet does not yet have any hot-reloading development tools.

### Budo

Budo is to browserify as webpack-dev-server is to webpack. It sets up a local dev server with hot reloads for CSS and JS bundles, again with very simple configuration.
