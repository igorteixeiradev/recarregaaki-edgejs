import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'web.home': { paramsTuple?: []; params?: {} }
    'web.about': { paramsTuple?: []; params?: {} }
    'web.contact': { paramsTuple?: []; params?: {} }
    'web.shop': { paramsTuple?: []; params?: {} }
    'web.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'web.blog': { paramsTuple?: []; params?: {} }
    'web.showBlogPost': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'web.profile': { paramsTuple?: []; params?: {} }
    'auth.login.view': { paramsTuple?: []; params?: {} }
    'auth.register.view': { paramsTuple?: []; params?: {} }
    'auth.forgot-password.view': { paramsTuple?: []; params?: {} }
    'auth.reset-password.view': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.store': { paramsTuple?: []; params?: {} }
    'auth.forgot-password': { paramsTuple?: []; params?: {} }
    'auth.reset-password': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.verifyEmail': { paramsTuple?: []; params?: {} }
    'auth.resendVerificationEmail': { paramsTuple?: []; params?: {} }
    'dashboard.index': { paramsTuple?: []; params?: {} }
    'dashboard.kz': { paramsTuple?: []; params?: {} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'categories.create': { paramsTuple?: []; params?: {} }
    'categories.store': { paramsTuple?: []; params?: {} }
    'categories.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refills.index': { paramsTuple?: []; params?: {} }
    'refills.create': { paramsTuple?: []; params?: {} }
    'refills.store': { paramsTuple?: []; params?: {} }
    'refills.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refills.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refills.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'packages.index': { paramsTuple: [ParamValue]; params: {'refillId': ParamValue} }
    'packages.create': { paramsTuple: [ParamValue]; params: {'refillId': ParamValue} }
    'packages.store': { paramsTuple: [ParamValue]; params: {'refillId': ParamValue} }
    'packages.edit': { paramsTuple: [ParamValue,ParamValue]; params: {'refillId': ParamValue,'id': ParamValue} }
    'packages.update': { paramsTuple: [ParamValue,ParamValue]; params: {'refillId': ParamValue,'id': ParamValue} }
    'packages.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'refillId': ParamValue,'id': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.create': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'users.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.index': { paramsTuple?: []; params?: {} }
    'blog.index': { paramsTuple?: []; params?: {} }
    'blog.create': { paramsTuple?: []; params?: {} }
    'blog.store': { paramsTuple?: []; params?: {} }
    'blog.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'web.home': { paramsTuple?: []; params?: {} }
    'web.about': { paramsTuple?: []; params?: {} }
    'web.contact': { paramsTuple?: []; params?: {} }
    'web.shop': { paramsTuple?: []; params?: {} }
    'web.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'web.blog': { paramsTuple?: []; params?: {} }
    'web.showBlogPost': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'web.profile': { paramsTuple?: []; params?: {} }
    'auth.login.view': { paramsTuple?: []; params?: {} }
    'auth.register.view': { paramsTuple?: []; params?: {} }
    'auth.forgot-password.view': { paramsTuple?: []; params?: {} }
    'auth.reset-password.view': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.verifyEmail': { paramsTuple?: []; params?: {} }
    'auth.resendVerificationEmail': { paramsTuple?: []; params?: {} }
    'dashboard.index': { paramsTuple?: []; params?: {} }
    'dashboard.kz': { paramsTuple?: []; params?: {} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'categories.create': { paramsTuple?: []; params?: {} }
    'categories.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refills.index': { paramsTuple?: []; params?: {} }
    'refills.create': { paramsTuple?: []; params?: {} }
    'refills.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'packages.index': { paramsTuple: [ParamValue]; params: {'refillId': ParamValue} }
    'packages.create': { paramsTuple: [ParamValue]; params: {'refillId': ParamValue} }
    'packages.edit': { paramsTuple: [ParamValue,ParamValue]; params: {'refillId': ParamValue,'id': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.create': { paramsTuple?: []; params?: {} }
    'users.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.index': { paramsTuple?: []; params?: {} }
    'blog.index': { paramsTuple?: []; params?: {} }
    'blog.create': { paramsTuple?: []; params?: {} }
    'blog.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'web.home': { paramsTuple?: []; params?: {} }
    'web.about': { paramsTuple?: []; params?: {} }
    'web.contact': { paramsTuple?: []; params?: {} }
    'web.shop': { paramsTuple?: []; params?: {} }
    'web.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'web.blog': { paramsTuple?: []; params?: {} }
    'web.showBlogPost': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'web.profile': { paramsTuple?: []; params?: {} }
    'auth.login.view': { paramsTuple?: []; params?: {} }
    'auth.register.view': { paramsTuple?: []; params?: {} }
    'auth.forgot-password.view': { paramsTuple?: []; params?: {} }
    'auth.reset-password.view': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.verifyEmail': { paramsTuple?: []; params?: {} }
    'auth.resendVerificationEmail': { paramsTuple?: []; params?: {} }
    'dashboard.index': { paramsTuple?: []; params?: {} }
    'dashboard.kz': { paramsTuple?: []; params?: {} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'categories.create': { paramsTuple?: []; params?: {} }
    'categories.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refills.index': { paramsTuple?: []; params?: {} }
    'refills.create': { paramsTuple?: []; params?: {} }
    'refills.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'packages.index': { paramsTuple: [ParamValue]; params: {'refillId': ParamValue} }
    'packages.create': { paramsTuple: [ParamValue]; params: {'refillId': ParamValue} }
    'packages.edit': { paramsTuple: [ParamValue,ParamValue]; params: {'refillId': ParamValue,'id': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.create': { paramsTuple?: []; params?: {} }
    'users.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.index': { paramsTuple?: []; params?: {} }
    'blog.index': { paramsTuple?: []; params?: {} }
    'blog.create': { paramsTuple?: []; params?: {} }
    'blog.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.store': { paramsTuple?: []; params?: {} }
    'auth.forgot-password': { paramsTuple?: []; params?: {} }
    'auth.reset-password': { paramsTuple?: []; params?: {} }
    'categories.store': { paramsTuple?: []; params?: {} }
    'refills.store': { paramsTuple?: []; params?: {} }
    'packages.store': { paramsTuple: [ParamValue]; params: {'refillId': ParamValue} }
    'users.store': { paramsTuple?: []; params?: {} }
    'blog.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'categories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refills.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'packages.update': { paramsTuple: [ParamValue,ParamValue]; params: {'refillId': ParamValue,'id': ParamValue} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'categories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refills.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'packages.update': { paramsTuple: [ParamValue,ParamValue]; params: {'refillId': ParamValue,'id': ParamValue} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'categories.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'refills.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'packages.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'refillId': ParamValue,'id': ParamValue} }
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}