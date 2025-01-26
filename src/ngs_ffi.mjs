import path from 'path';
import { build, context } from 'esbuild'
import { Ok, Error } from "./gleam.mjs"

const banner = ``
const footer = `export default exports()`

export function bundle_build(entry, out) {
  return new Promise(resolve => {
      build({
        entryPoints: [entry],
        bundle: true,
        minify: false,
        banner: {js : banner},
        footer: {js : footer},
        // keepNames: true,
        format: 'esm',
        outfile: out,
        external: ['querystring', 'crypto'],
        plugins: [],
        target: ['es2020'],
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
        banner: {js : banner},
        footer: {js : footer},
        // keepNames: true,
        format: 'esm',
        outfile: out,
        external: ['querystring', 'crypto'],
        plugins: [],
        target: ['es2020'],
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
