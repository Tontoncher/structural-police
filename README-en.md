[RU](https://github.com/Tontoncher/structural-police/blob/master/README.md) | [EN](https://github.com/Tontoncher/structural-police/blob/master/README-en.md)

# **structural-police**
eslint plugin to control file structure and imports

# **Install**
npm i eslint-plugin-structural-police

# **Quick start**
```
// .eslintrc.[js|yml|json]

{
    "plugins": [
        // ... some of your plugins
        "structural-police"
    ],
    "extends": [
        // ... some of your plugin configs
        
        // one of the configs
        "plugin:structural-police/recommended"
        // or
        "plugin:structural-police/featureSliced"
    ],
}
```

# **Setting**
Rule `import-permission-schema` takes 5 arguments:

1. `schema`:_object_ - Import validation scheme (more details in "Scheme")
2. `inheritance`:_boolean_ - Rule inheritance. If the child node does not have its own
   rules, the rules of the nearest parent will be applied
3. `entryPoints`:_array of string_ - An array of paths to validated files
4. `everywhereAllowed`:_array of string_ - An array of paths to files whose imports
   are always available
5. `customErrorMessages`:_object_ - Object with callbacks generating error texts
   (more details in "Custom error messages")

# **Scheme**
...in progress. And now you can see the Russian Readme

# **Custom error messages**
...in progress. And now you can see the Russian Readme

## **Rules**
...in progress. And now you can see the Russian Readme

## !!! Important !!!
...in progress. And now you can see the Russian Readme

## !!! Interesting !!!
...in progress. And now you can see the Russian Readme
