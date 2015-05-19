# CSS Documentation support for SourceJS

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/sourcejs/Source)

Appends rendered [DSS](https://github.com/darcyclarke/DSS) documentation into SourceJS Spec pages. Watch rendered [example Spec](http://sourcejs.com/specs/example-specs-showcase/dss/) and it's [source code](https://github.com/sourcejs/example-specs-showcase/blob/master/dss/css/dss.css).

[SourceJS](http://sourcejs.com) plugin (for 0.5.0+ version).

## Install

To install middleware, run npm command in `sourcejs/user` folder:

```
npm install sourcejs-contrib-dss --save
```

After restarting your app, middleware will be loaded automatically. To disable it, remove npm module and restart the app.

## Usage

DSS works as SourceJS middleware, when Spec (documentation page) is requested, plugin is searching CSS files in Spec folder by defined mask.

All found CSS (or LESS/SASS/SCSS/Stylus) will be processed through [DSS](https://github.com/darcyclarke/DSS) in runtime, during request.

Here's an example of Spec folder structure

```
specs/button
    button.css
    readme.md
    info.json
```

`button.css` contents:

```css
/**
  * @name Default
  *
  * @state .button-pro_big - Bigger version
  *
  * @markup
  *   <button class="button-pro">Click me</button>
  */

.button-pro {}
.button-pro.button-pro_big {}

/**
  * @name Disabled
  *
  * @state .button-pro_big - Bigger disabled version
  *
  * @markup
  *   <button class="button-pro button-pro_disabled">Click me</button>
  */

.button-pro.button-pro_disabled {}
```

Spec rendered result (http://127.0.0.1:8080/specs/button):

![image](http://d.pr/i/GH6g+)

`readme.md` contents will be rendered at the top of Spec file. Other file types as `index.src` or `index.jade` (with [Jade plugin](https://github.com/sourcejs/sourcejs-jade)) could also be used.

**Note** that Spec file and `info.json` should be present in folder for page to load.

## Options

You can configure plugin options from `user/options.js`:

```js
{
    core: {},
    assets: {},
    plugins: {
        dss: {
           targetCssMask: '**/*.{css,less,stylus,sass,scss}',
           visibleCode: true,
           templates: {
               sections: path.join(__dirname, '../views/sections.ejs')
           }
        }
    }
}
```

### targetCssMask

Type: `String`
Default value: `**/*.{css,less,stylus,sass,scss}`

Glob mask for searching CSS files for DSS parsing, starting from requested Spec path (https://github.com/isaacs/node-glob).

### visibleCode

Type: `Boolean`
Default: `true`

Set `source_visible` to every `src-html` code containers to show code preview by default. Set to `false` if you prefer hiding code blocks by default (toggled from menu `Show source code`).

### templates

Type: `Object`

#### templates.item

Type: `String`
Default: `path.join(__dirname, '../views/sections.ejs')`

Set path to EJS template for rendering DSS JSON result. Currently this plugin uses only one template for sections.

## Upcoming features

* DSS parser caching
* Pre-build cache (during app start)
* DSS improvements

## Other SourceJS middlewares

* https://github.com/sourcejs/sourcejs-jade
* https://github.com/sourcejs/sourcejs-smiles
