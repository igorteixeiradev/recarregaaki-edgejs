import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  required: 'O campo é obrigatório',
  string: 'O campo deve conter texto',
  email: 'O valor não é um endereço de e-mail válido',
  unique: 'O valor do campo já está sendo usado',
  minLength: 'O campo deve ter pelo menos {{ min }} caracteres',
  maxLength: 'O campo não pode ter mais de {{ max }} caracteres',
  confirmed: 'A confirmação não correspondida',
  sameAs: 'O valor do campo deve ser iguais',
  url: 'O campo deve ser um URL válido',
  boolean: 'O campo deve ser verdadeiro ou falso',
  enum: 'O campo deve ser uma das seguintes opções: {{ enum }}',
  exists: '{{ enum }} não existe',
})
