import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'O campo é obrigatório',
  'string': 'O campo deve conter texto',
  'number': 'O campo deve ser um número',
  'email': 'O valor não é um endereço de e-mail válido',
  'minLength': 'O campo deve ter pelo menos {{ min }} caracteres',
  'maxLength': 'O campo não pode ter mais de {{ max }} caracteres',
  'min': 'O valor mínimo é {{ min }}',
  'confirmed': 'A confirmação não corresponde',
  'sameAs': 'O valor do campo deve ser igual',
  'url': 'O campo deve ser um URL válido',
  'uuid': 'O identificador é inválido',
  'boolean': 'O campo deve ser verdadeiro ou falso',
  'enum': 'O campo deve ser uma das seguintes opções: {{ choices }}',
  'database.unique': 'Este valor já está a ser utilizado',
  'database.exists': 'O valor selecionado não existe',
  'file.size': 'O ficheiro não pode ter mais de {{ size }}',
  'file.extname': 'O ficheiro deve ser de um dos tipos: {{ extnames }}',
})
