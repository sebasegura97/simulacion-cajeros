// Este archivo es para configurar HMR con CRA
// Mas info en: https://medium.com/@tommedema/hot-module-reloading-with-create-react-app-v3-f2c7afe1dae8

const rewireReactHotLoader = require('react-app-rewire-hot-loader')

module.exports = function override(config, env) {
    config = rewireReactHotLoader(config, env)

    config.resolve.alias = {
        ...config.resolve.alias,
        'react-dom': '@hot-loader/react-dom'
    }

    return config;
}