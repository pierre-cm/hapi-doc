# hapi-doc

#### Generates API documentation UI

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)

---

## Introduction

**hapi-doc** is a plugin for [hapi][hapi] which generate an API documentation based on hapi's routes settings.

![overview](doc/ui_overview.png)

## Installation

Using [npm][npm]:

```
$ npm install hapi-doc
```
Using [yarn][yarn]:

```
$ yarn add hapi-doc
```


## Usage

#### Import

Using CommonJS:

```js
const hapidoc = require('hapi-doc')
```
Using ESM:

```js
import hapidoc from 'hapi-doc'
```

#### Create hapi server

Afterwards create your hapi server if not already done:

```js
const hapi = require("@hapi/hapi")

const server = hapi.server({ port: 8080 })
```

#### Registration

Finally register the plugin. Available `options` are described in the next section.

```js
await server.register({ plugin: hapidoc, options })
```

#### Options

| name | description | default | 
| :- | :- | :- |
| path | path where the UI must be serevd | /doc |
| title | documentation title | Documentation |
| version | API version | package.json version \|\| '0.0.0' |
| description | description of your API. May accept markdown formatting |  |
| tags | list of tags to appear on the UI | all |
| servers | list of servers | current |

This is an example of valid options
```js
let options = {
    path: '/path/to/documentation',
    title: 'Documentation Title',
    version: '0.42.0',
    description: 'Description of the API',
    tags: ['pet', 'store', 'user'], 
    servers: [{url: 'http://localhost:8080'}],
}
```

#### Configure

hapi-doc will observe server's routes options in order to build the API model. Here are the following routes options that are used.
> The schema description for request and response objects must be done using [Joi][joi].

| name | description |  
| :- | :- |
| route.method | endpoint method | 
| route.path | endpoint path | 
| route.options.tags | list of tags | 
| route.options.description | description of the endpoint | 
| route.options.validate.params | Joi object representing path parameters | 
| route.options.validate.query | Joi object representing query parameters | 
| route.options.validate.payload | Joi object representing request body parameters | 
| route.options.response.status | key-value object where keys must be a valid HTTP status code and the value the Joi object representation of the response | 

Here is an example of hapi route configuration and the corresponding documentation endpoint generated.

```js
server.route({
  method: 'PUT',
  path: '/users/{userId}',
  handler: async (req, h) => {},
  options:{
    tags: ['users'],
    description: 'Update a user',
    validate:{
      params: Joi.object({
        userId: Joi.string()
          .guid({version:'uuidv4'})
          .description('Id of the user')
          .required()
      }), 
      payload: Joi.object({
        email: Joi.string().regex(EMAIL_RGX),
        password: Joi.string(),
        bio: Joi.string()
      })
    },
    response:{
      status:{
        200: Joi.string().description('successful operation'),
        404: Joi.string().description('user not found'),
      }
    }
  }
})
```
![routeExample](doc/route_example.png)

[hapi]: https://hapi.dev/
[npm]: https://github.com/npm/npm/
[yarn]: https://yarnpkg.com/
[joi]: https://joi.dev/
