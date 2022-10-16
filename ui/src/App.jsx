import { createSignal, createEffect, createMemo } from 'solid-js'
import './styles/index.scss'
import _ from 'lodash'
import yaml from 'js-yaml'
import {marked} from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

const EmptyMessage = <div class="EmptyMessage"><p>Nothing out there.</p></div>

const ParamsList = ({params}) => {
  return (params && params.length > 0 ?
    <table class="table is-bordered is-narrow is-fullwidth">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {params.map(p=>
          <tr>
            <td class="primary Param">
              <span>{p.name}</span>
              {p.required ? <div class="RequiredIcon" data-tooltip="required"><ion-icon name="alert-circle-outline" ></ion-icon></div> : null}
            </td>
            <td>{p.schema.type}</td><td>{p.description}</td>
          </tr>)}
      </tbody>
    </table>
  : <div class="EmptyMessage"><p>Nothing out there.</p></div>)
}
const RequestBody = ({body}) => {
  if(!body) return EmptyMessage
  let schema = body.content['application/json']?.schema
  return (!(_.isEmpty(schema)) ?
    <pre class="CodeBlock" innerHTML={DOMPurify.sanitize(hljs.highlight(yaml.dump(schema), {language:'yaml'}).value)}/>
    : EmptyMessage)
}
const ResponseBody = ({body}) => {
  if(!body) return EmptyMessage
  return (!(_.isEmpty(body)) ?
    <pre class="CodeBlock" innerHTML={DOMPurify.sanitize(hljs.highlight(yaml.dump(body), {language:'yaml'}).value)}/>
    : EmptyMessage)
}

const parsePath = (path) => {
  const pathParams = path.replaceAll(/\{([^\}]*)\}/g, '{<span class="PathParam">$1</span>}')
  return <div innerHTML={pathParams}/>
}

const App = () => {
  const [api, setApi] = createSignal(window.HAPIDOC_OPENAPI)
  const items = () => api() ? Object.entries(api().paths).map(([path,d]) => Object.entries(d).map(([method, data]) => ({id:`[${method}]${path}`, path, method,...data}))).flat().reduce((a, e) => ({...a,[e.id]:e}), {}):{}
  const [tagSelected, setTagSelected] = createSignal(null)
  const [selection, setSelection] = createSignal(null)

  createEffect(() => {
    setSelection(Object.fromEntries(Object.entries(items()).map(([id, i]) => [id,{selected: false, request:'params', response: Object.keys(i.responses)[0]}])))
  })
  createEffect(() => {
    if(api()?.tags?.length > 0)setTagSelected(api().tags[0].name)
  })

  return (
    api() ?
    <div id="hapi-doc">
      <header><h1>{api().info.title}</h1><span class="tag is-primary">{api().info.version}</span></header>
      <div innerHTML={DOMPurify.sanitize(marked.parse(api().info.description))}/>
      <div class="tabs is-medium">
        <ul>
          {api().tags.map(tag => <li class={tagSelected()===tag.name ? "is-active" : ""}><a onClick={()=>setTagSelected(tag.name)}>{tag.name}</a></li>)}
        </ul>
      </div>
      <div class="List">
        {Object.entries(items()).filter(([k,i])=>i.tags.includes(tagSelected())).map(([key,item])=>{
          return (<div class="card">
            <header class="card-header ListItemHeader" onClick={()=>setSelection(s=>({...s,[key]:{...s[key], selected: !s[key].selected}}))}>
              <div class="Left">
                <span class={`tag method is-medium m_${item.method}`}>{item.method.toUpperCase()}</span>
                <b>{parsePath(item.path)}</b>
                <div class="ItemDescription">{item.description}</div>
              </div>
              <div class="Right">
                <button class="card-header-icon" aria-label="more options">
                  <span class="icon">
                    <ion-icon name="chevron-down-outline"></ion-icon>
                  </span>
                </button>
              </div>
            </header>

            <div class={`card-content ListItemContent ${selection()[key].selected ? '' : 'is-hidden' }`}>
              <div class="Left">
                <h2>Request</h2>
                <div class="tabs">
                  <ul>
                    {
                      [['params','Path params'],['query','Query params'],['body','Body']]
                      .map(([name, label]) => (
                        <li class={selection()[key].request===name?'is-active':''}><a onClick={()=>setSelection(s=>({...s,[key]:{...s[key],request:name}}))}>{label}</a></li>
                      ))
                    }
                  </ul>
                </div>
                <div>
                  {{
                    params: <ParamsList params={item.parameters?.filter(p=>p.in==='path')} />,
                    query: <ParamsList params={item.parameters?.filter(p=>p.in==='query')} />,
                    body: <RequestBody body={item.requestBody} />
                  }[selection()[key].request]}
                </div>
              </div>
              <div class="Right">
                <h2>Response</h2>
                <div class="tabs">
                  <ul>
                    {Object.keys(item.responses).map(r=>(<li class={selection()[key].response===r?'is-active':''}><a onClick={()=>setSelection(s=>({...s,[key]:{...s[key],response:r}}))}>{r}</a></li>))}
                  </ul>
                </div>
                <div>
                  {Object.fromEntries(Object.entries(item.responses).map(([k,v])=>[k,<ResponseBody body={v}/>]))[selection()[key].response]}
                </div>
              </div>
            </div>
          </div>)
        })}
      </div>
    </div>
  : null)
}

export default App
