/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://zipek.cl',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/login',
    '/propuesta',
    '/nosotros',
    '/seguimiento',
    '/consultas',
    '/blog',
    '/blog/*',
    '/casos-de-exito',
    '/casos-de-exito/*',
  ],
}
