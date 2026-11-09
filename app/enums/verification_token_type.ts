/**
 * O tipo impede que um token enviado para verificar o email seja aceite
 * no fluxo de recuperação de palavra-passe (e vice-versa).
 */
export const VerificationTokenType = {
  EmailVerification: 'EMAIL_VERIFICATION',
  PasswordReset: 'PASSWORD_RESET',
} as const

export type VerificationTokenType =
  (typeof VerificationTokenType)[keyof typeof VerificationTokenType]
