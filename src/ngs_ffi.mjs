import { es5Plugin } from 'esbuild-plugin-es5';
import path from 'path';
import { build, context } from 'esbuild'
import { Ok, Error } from "./gleam.mjs"

const banner = `(function(e){"use strict";if(e.WeakMap){return}var r=Object.prototype.hasOwnProperty;var n=Object.defineProperty&&function(){try{return Object.defineProperty({},"x",{value:1}).x===1}catch(e){}}();var i=function(e,t,r){if(n){Object.defineProperty(e,t,{configurable:true,writable:true,value:r})}else{e[t]=r}};e.WeakMap=function(){function WeakMap(){if(this===void 0){throw new TypeError("Constructor WeakMap requires 'new'")}i(this,"_id",genId("_WeakMap"));if(arguments.length>0){throw new TypeError("WeakMap iterable is not supported")}}i(WeakMap.prototype,"delete",function(e){checkInstance(this,"delete");if(!isObject(e)){return false}var t=e[this._id];if(t&&t[0]===e){delete e[this._id];return true}return false});i(WeakMap.prototype,"get",function(e){checkInstance(this,"get");if(!isObject(e)){return void 0}var t=e[this._id];if(t&&t[0]===e){return t[1]}return void 0});i(WeakMap.prototype,"has",function(e){checkInstance(this,"has");if(!isObject(e)){return false}var t=e[this._id];if(t&&t[0]===e){return true}return false});i(WeakMap.prototype,"set",function(e,t){checkInstance(this,"set");if(!isObject(e)){throw new TypeError("Invalid value used as weak map key")}var r=e[this._id];if(r&&r[0]===e){r[1]=t;return this}i(e,this._id,[e,t]);return this});function checkInstance(e,t){if(!isObject(e)||!r.call(e,"_id")){throw new TypeError(t+" method called on incompatible receiver "+typeof e)}}function genId(e){return e+"_"+rand()+"."+rand()}function rand(){return Math.random().toString().substring(2)}i(WeakMap,"_polyfill",true);return WeakMap}();function isObject(e){return Object(e)===e}})(typeof globalThis!=="undefined"?globalThis:typeof self!=="undefined"?self:typeof window!=="undefined"?window:typeof global!=="undefined"?global:this);`

export function bundle_build(entry, out) {
  return new Promise(resolve => {
      build({
        entryPoints: [entry],
        bundle: true,
        minify: false,
        banner: {js : banner},
        footer: {js : "export default app.exports()"},
        // keepNames: true,
        format: 'iife',
        globalName: 'app',
        outfile: out,
        external: ['querystring', 'crypto'],
        plugins: [es5Plugin()], // # 1. Use esbuild-plugin-es5
        target: ['es5'], // # 2. Set the target to es5
        alias: {
          // # 3. Set the alias to @swc/helpers
          '@swc/helpers': path.dirname('@swc/helpers/package.json'),
        }
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
        footer: {js : "export default app.exports()"},
        // keepNames: true,
        format: 'iife',
        globalName: 'app',
        outfile: out,
        external: ['querystring', 'crypto'],
        plugins: [es5Plugin()], // # 1. Use esbuild-plugin-es5
        target: ['es5'], // # 2. Set the target to es5
        alias: {
          // # 3. Set the alias to @swc/helpers
          '@swc/helpers': path.dirname('@swc/helpers/package.json'),
        }
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
