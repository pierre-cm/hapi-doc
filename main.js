import Path from 'path'
import { convert } from 'joi-openapi'

import fs from 'fs'

const injectEnv = async (openAPI, config) => {
    let envStr = `window.HAPIDOC_OPENAPI = ${JSON.stringify(openAPI)};window.HAPIDOC_CONFIG = ${JSON.stringify(config)};`
    fs.writeFileSync(Path.resolve(__dirname, '../ui/dist/env.js'), envStr)
}
const parseJoiSchema = (joiSchema) => {
    if (!joiSchema) return null
    let obj = {type: joiSchema.type}
    if (joiSchema.type=='object') obj['properties'] = {}
    joiSchema._ids._byKey.forEach(({id, schema}) => {
        obj.properties[id] = parseJoiSchema(schema)
    })
    return obj
}
const parseParam = (schema, type) => {
    if (!schema) return []
    let converted = convert(schema)
    return Object.entries(converted.properties).map(([k,v])=>({
        name: k,
        schema: v,
        in:type,
        description: v.description,
        required: converted.required?.includes(k)
    }))
}

exports.plugin = {
    name: 'hapi-doc',
    version: '1.0.0',
    register: async (server, {path, title, version, description, tags, servers}) => {
        let pkgVersion = '0.0.0'
        let paths = {}
        let docPath = path || '/doc'

        await import(`${process.cwd()}/package.json`).then(pkg => pkgVersion = pkg.version).catch(e=>{})
        
        // Construct OpenAPI paths from routes settings
        server.table().forEach(route =>{
            let params = route.settings.validate.params
            let query = route.settings.validate.query
            let payload = route.settings.validate.payload
            let responses = route.settings.response.status || {}
            if(!(route.path in paths)) paths[route.path] = {}
            paths[route.path][route.method] = {
                description: route.settings.description,
                tags: route.settings.tags || [],
                parameters: [
                    ...parseParam(params, 'path'),
                    ...parseParam(query, 'query')
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: (payload) ? convert(payload) : {}
                        }
                    }
                },
                responses: Object.fromEntries(Object.entries(responses).map(([s,r])=>[s,convert(r)]))
            }
        })

        // List all tags
        let tagSet = new Set(Object.entries(paths).map(([k,v])=>Object.entries(v).map(([k2,v2])=>v2.tags).flat()).flat())
        
        injectEnv(
            {
                openapi: '3.0.3',
                info:{
                    title: title || 'Documentation',
                    description: description || '',
                    version: version || pkgVersion,
                    servers: servers || [{url: server.info.uri}]
                },
                tags: tags || [...tagSet].map(t=>({name: t})),
                paths: paths
            },
            { title: title }
        )

        server.route({method: 'GET', path: docPath, handler: (req, h) => h.redirect(`${req.path}/`)})
        server.route({
            method: 'GET',
            path: `${docPath}/{param*}`,
            handler: {
                directory: {
                    path: Path.resolve(__dirname,'../ui/dist'),
                    redirectToSlash: true,
                    index: true
                }
            }
        })
    }
}
