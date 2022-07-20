# **structural-police**
eslint plugin to control file structure and imports

# **Install**
npm i eslint-plugin-structural-police

# **Настройка**
Rule `import-permission-schema` takes 4 arguments:

1. `schema`:_object_ - Import validation scheme (more details in "Scheme")
2. `inheritance`:_boolean_ - Rule inheritance. If the child node does not have its own
   rules, the rules of the nearest parent will be applied
3. `entryPoints`:_array of string_ - An array of paths to validated files
4. `everywhereAllowed`:_array of string_ - An array of paths to files whose imports
   are always available
