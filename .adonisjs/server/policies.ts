export const policies = {
  CategoryPolicy: () => import('#policies/category_policy'),
  DashboardPolicy: () => import('#policies/dashboard_policy'),
  PackagePolicy: () => import('#policies/package_policy'),
  PaymentPolicy: () => import('#policies/payment_policy'),
  PostPolicy: () => import('#policies/post_policy'),
  RefillPolicy: () => import('#policies/refill_policy'),
  UserPolicy: () => import('#policies/user_policy'),
}

