# Frontity Services

A series of serverless microservices that power up the WP REST API. They are ready to deploy with [Now](https://zeit.co/now) serverless infrastructure.

## List of services

### Add media ids

The service `/add-media-ids` searches the `content.rendered` field for images, then tries to find them in the REST API and finally attaches the results to the final response in both `content_media` array (ids) and `_embedded.wp:contentmedia` (media object).

### Add title

The service `/add-title` looks in the `title` field and converts it to `{ title: rendered: "...", text: "..." }` if it doesn't have that shape.

## Changelog

This project adheres to [Semantic Versioning](https://semver.org/) and [Angular Conventional Changelog](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).
Every release is documented on the [Github Releases](https://github.com/frontity/frontity/releases) page.

## License

This project is licensed under the terms of the [Apache 2.0](https://github.com/frontity/frontity/blob/master/LICENSE) license.

## Contribute

Please take a look at our [Contribution Guide](https://github.com/frontity/contribute).
