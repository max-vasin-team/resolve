import {
  defaultResolveConfig,
  build,
  start,
  watch,
  runTestcafe,
  merge,
  stop,
  reset,
  importEventStore,
  exportEventStore,
} from '@resolve-js/scripts'

import appConfig from './config.app'
import cloudConfig from './config.cloud'
import devConfig from './config.dev'
import prodConfig from './config.prod'
import testFunctionalConfig from './config.test-functional'
import resolveModuleUploader from '@resolve-js/module-uploader'

const launchMode = process.argv[2]

void (async () => {
  try {
    const moduleUploader = resolveModuleUploader({
      publicDirs: ['logo', 'avatar'],
      expireTime: 604800,
      jwtSecret: 'SECRETJWT',
    })
    switch (launchMode) {
      case 'dev': {
        const resolveConfig = merge(
          defaultResolveConfig,
          appConfig,
          devConfig,
          moduleUploader
        )
        await watch(resolveConfig)
        break
      }

      case 'build': {
        const resolveConfig = merge(
          defaultResolveConfig,
          appConfig,
          prodConfig,
          moduleUploader
        )
        await build(resolveConfig)
        break
      }

      case 'cloud': {
        await build(
          merge(defaultResolveConfig, appConfig, cloudConfig, moduleUploader)
        )
        break
      }

      case 'start': {
        await start(
          merge(defaultResolveConfig, appConfig, prodConfig, moduleUploader)
        )
        break
      }

      case 'reset': {
        const resolveConfig = merge(defaultResolveConfig, appConfig, devConfig)
        await reset(resolveConfig, {
          dropEventStore: false,
          dropEventSubscriber: true,
          dropReadModels: true,
          dropSagas: true,
        })

        break
      }

      case 'import-event-store': {
        const resolveConfig = merge(defaultResolveConfig, appConfig, devConfig)

        const directory = process.argv[3]

        await importEventStore(resolveConfig, { directory })
        break
      }

      case 'export-event-store': {
        const resolveConfig = merge(defaultResolveConfig, appConfig, devConfig)

        const directory = process.argv[3]

        await exportEventStore(resolveConfig, { directory })
        break
      }

      case 'test:e2e': {
        const resolveConfig = merge(
          defaultResolveConfig,
          appConfig,
          testFunctionalConfig
        )

        await reset(resolveConfig, {
          dropEventStore: true,
          dropEventSubscriber: true,
          dropReadModels: true,
          dropSagas: true,
        })

        await runTestcafe({
          resolveConfig,
          functionalTestsDir: 'test/functional',
          browser: process.argv[3],
          customArgs: ['--stop-on-first-fail'],
        })
        break
      }

      default: {
        throw new Error('Unknown option')
      }
    }
    await stop()
  } catch (error) {
    await stop(error)
  }
})()
