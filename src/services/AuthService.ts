import { api } from 'boot/axios'
import type { AxiosResponse } from 'axios'
const CSRF_TOKEN_ROUTE = process.env.API + '/sanctum/csrf-cookie'
const LOGIN_ROUTE = '/login'
const LOGOUT_ROUTE = '/logout'
// const GET_USER = '/user'
const GET_USER_ROUTE = '/user'
// const PASSWORD_FORGOT_ROUTE = '/admin/password/forgot'

/** export default {
  async login (payload) {
    await api.get(CSRF_TOKEN_ROUTE)
    return api.post(LOGIN_ROUTE, payload)
  },
  async forgotPassword (payload) {
    await api.get(CSRF_TOKEN_ROUTE)
    return api.post(PASSWORD_FORGOT_ROUTE, payload)
  },
  logout () {
    return api.post('/logout')
  },
  getAuthUser () {
    return api.get(GET_USER)
  }
} */
// Type definitions
interface LoginPayload {
  email: string
  password: string
  spa_description: string
  device_information: Record<string, number>
}

interface ForgotPasswordPayload {
  email: string
}

interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

interface LoginResponse {
  user: User
  token?: string
  message?: string
}

interface ForgotPasswordResponse {
  message: string
  status?: string
}

interface LogoutResponse {
  message: string
}

interface ValidationError {
  message: string
  errors: Record<string, string[]>
}

interface ApiError extends Error {
  response?: {
    status: number
    data: ValidationError | string
  }
}
/**
 * AuthService - Handles authentication operations with Laravel Sanctum
 */
class AuthService {
  /**
   * Get CSRF token from Laravel Sanctum
   * @private
   */
  private async _getCsrfToken(): Promise<void> {
    try {
      await api.get(CSRF_TOKEN_ROUTE)
    } catch (error) {
      console.error('Failed to get CSRF token:', error)
      throw new Error('Falha ao obter token de segurança')
    }
  }

  /**
   * Login user with email and password
   */
  async login(payload: LoginPayload): Promise<AxiosResponse<LoginResponse>> {
    try {
      // Get CSRF token before login attempt
      await this._getCsrfToken()

      const response = await api.post<LoginResponse>(LOGIN_ROUTE, payload)

      // Validate response structure
      if (!response.data) {
        throw new Error('Resposta inválida do servidor')
      }

      return response
    } catch (error) {
      const apiError = error as ApiError

      // Handle specific error cases
      if (apiError.response?.status === 422) {
        const errors = (apiError.response.data as ValidationError)?.errors
        if (errors) {
          // Handle validation errors
          const firstError = Object.values(errors)[0]?.[0]
          throw new Error(firstError || 'Dados de login inválidos')
        }
      } else if (apiError.response?.status === 401) {
        throw new Error('Credenciais inválidas')
      } else if (apiError.response?.status === 429) {
        throw new Error('Muitas tentativas de login. Tente novamente em alguns minutos.')
      } else if (!apiError.response) {
        throw new Error('Erro de conexão. Verifique sua internet.')
      }

      // Re-throw the error to be handled by the component
      throw error
    }
  }

  /**
   * Send password reset email
   */
  // async forgotPassword(payload: ForgotPasswordPayload): Promise<AxiosResponse<ForgotPasswordResponse>> {
  //   try {
  //     await this._getCsrfToken()
  //
  //     const response = await api.post<ForgotPasswordResponse>(PASSWORD_FORGOT_ROUTE, payload)
  //
  //     if (!response.data) {
  //       throw new Error('Resposta inválida do servidor')
  //     }
  //
  //     return response
  //   } catch (error) {
  //     const apiError = error as ApiError
  //
  //     if (apiError.response?.status === 422) {
  //       const errors = (apiError.response.data as ValidationError)?.errors
  //       if (errors) {
  //         const firstError = Object.values(errors)[0]?.[0]
  //         throw new Error(firstError || 'Email inválido')
  //       }
  //     } else if (apiError.response?.status === 404) {
  //       throw new Error('Email não encontrado em nossos registros')
  //     } else if (apiError.response?.status === 429) {
  //       throw new Error('Muitas tentativas. Tente novamente mais tarde.')
  //     } else if (!apiError.response) {
  //       throw new Error('Erro de conexão. Verifique sua internet.')
  //     }
  //
  //     throw error
  //   }
  // }

  /**
   * Logout current user
   */
  async logout(): Promise<AxiosResponse<LogoutResponse>> {
    try {
      return await api.post<LogoutResponse>(LOGOUT_ROUTE)
    } catch (error) {
      // const apiError = error as ApiError
      // Even if logout fails on server, we should clear client state
      console.error('Logout error:', error)

      // if (apiError.response?.status === 401) {
      //   // Already logged out
      //   return {
      //     data: { message: 'Already logged out' },
      //     status: 200,
      //     statusText: 'OK',
      //     headers: {},
      //     config: {} as any
      //   }
      // }

      throw new Error('Erro ao fazer logout')
    }
  }

  /**
   * Get authenticated user data
   */
  async getAuthUser(): Promise<AxiosResponse<User>> {
    try {
      const response = await api.get<User>(GET_USER_ROUTE)

      if (!response.data) {
        throw new Error('Resposta inválida do servidor')
      }

      return response
    } catch (error) {
      const apiError = error as ApiError

      if (apiError.response?.status === 401) {
        throw new Error('Usuário não autenticado')
      } else if (!apiError.response) {
        throw new Error('Erro de conexão. Verifique sua internet.')
      }

      throw error
    }
  }

  /**
   * Check if user is authenticated by making a request to get user data
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getAuthUser()
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }
}

// Export singleton instance
export default new AuthService()

// Export types for use in other files
export type {
  LoginPayload,
  ForgotPasswordPayload,
  User,
  LoginResponse,
  ForgotPasswordResponse,
  LogoutResponse
}
