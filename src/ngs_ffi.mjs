import { build, context } from 'esbuild'
import { Ok, Error } from "./gleam.mjs"

export function bundle_build(entry, out) {
  return new Promise(resolve => {
      build({
        entryPoints: [entry],
        bundle: true,
        minify: true,
        footer: {js : "export default app.exports()"},
        keepNames: true,
        format: 'iife',
        globalName: 'app',
        outfile: out,
        external: ['querystring'],
      }).then(function(r){
        resolve(new Ok(undefined))
      }).catch(function(e){
        resolve(new Error(JSON.stringify(e)))
      })
  })
}

export function copy_build(src, out) {
  return new Promise(resolve => {
      build({
        entryPoints: [src],
        loader: {'.conf': 'copy'},
        outfile: out,
      }).then(function(r){
        resolve(new Ok(undefined))
      }).catch(function(e){
        resolve(new Error(JSON.stringify(e)))
      })
  })
}

export function bundle_watch(entry, out) {
  return new Promise(resolve => {
      context({
        entryPoints: [entry],
        bundle: true,
        minify: true,
        footer: "export default app.exports()",
        keepNames: true,
        format: 'iife',
        globalName: 'app',
        outfile: out,
        external: ['querystring'],
      }).then(function(ctx){
        ctx.watch()
        console.log(`watching bundle ${entry}...`)
      }).then(function(){
        resolve(new Ok(undefined))
      }).catch(function(e){
        resolve(new Error(JSON.stringify(e)))
      })
  })
}

export function copy_watch(src, out) {
  return new Promise(resolve => {
      context({
        entryPoints: [src],
        loader: {'.conf': 'copy'},
        outfile: out,
      }).then(function(ctx){
        ctx.watch()
        console.log(`watching ${src}...`)
      }).then(function(){
        resolve(new Ok(undefined))
      }).catch(function(e){
        resolve(new Error(JSON.stringify(e)))
      })
  })
}
