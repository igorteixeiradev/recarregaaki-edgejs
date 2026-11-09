import Category from '#models/category'
import Package from '#models/package'
import Payment from '#models/payment'
import Refill from '#models/refill'
import User from '#models/user'
import { PaymentStatus } from '#enums/payment_status'

let counter = 0
const next = () => ++counter

export const createUser = (attrs: Partial<User> = {}) =>
  User.create({
    fullName: 'Utilizador Teste',
    email: `user${next()}@example.com`,
    password: 'password123',
    isEmailVerified: true,
    ...attrs,
  })

export const createAdmin = (attrs: Partial<User> = {}) => createUser({ isAdmin: true, ...attrs })

export const createCategory = (attrs: Partial<Category> = {}) =>
  Category.create({ name: `Categoria ${next()}`, isActive: true, ...attrs })

export const createRefill = async (attrs: Partial<Refill> = {}) => {
  const categoryId = attrs.categoryId ?? (await createCategory()).id
  return Refill.create({
    name: `Recarga ${next()}`,
    description: 'Descrição da recarga com mais de vinte caracteres',
    isActive: true,
    ...attrs,
    categoryId,
  })
}

export const createPackage = async (attrs: Partial<Package> = {}) => {
  const refillId = attrs.refillId ?? (await createRefill()).id
  return Package.create({
    name: `Pacote ${next()}`,
    price: 1000,
    isActive: true,
    isSpecialOffer: false,
    ...attrs,
    refillId,
  })
}

export const createPayment = async (attrs: Partial<Payment> = {}) => {
  const userId = attrs.userId ?? (await createUser()).id
  const packageId = attrs.packageId ?? (await createPackage()).id
  return Payment.create({ amount: 1000, status: PaymentStatus.Paid, ...attrs, userId, packageId })
}
