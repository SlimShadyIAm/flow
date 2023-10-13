const path = require('path')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withPWA = require('next-pwa')({
  dest: 'public',
})
const withTM = require('next-transpile-modules')([
  '@flow/internal',
  '@flow/epubjs',
  '@material/material-color-utilities',
])

const IS_DEV = process.env.NODE_ENV === 'development'
const IS_DOCKER = process.env.DOCKER


/**
 * @type {import('next').NextConfig}
 **/
const config = {
  pageExtensions: ['ts', 'tsx'],
  webpack(config) {
    return config
  },
  i18n: {
    locales: ['en-US', 'zh-CN'],
    defaultLocale: 'en-US',
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  ...(IS_DOCKER && {
    output: 'standalone',
    experimental: {
      outputFileTracingRoot: path.join(__dirname, '../../'),
    },
  }),
}

const base = withPWA(withTM(withBundleAnalyzer(config)))

const dev = base
const docker = base
const prod = base

module.exports = IS_DEV ? dev : IS_DOCKER ? docker : prod
